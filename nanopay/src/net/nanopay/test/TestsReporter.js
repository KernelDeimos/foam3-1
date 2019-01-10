foam.CLASS({
  package: 'net.nanopay.test',
  name: 'TestsReporter',
  documentation: 'Reports the total number of tests written to a Slack channel.',

  javaImports: [
    'foam.dao.DAO',
    'foam.dao.ArraySink',
    'foam.nanos.test.Test',
    'foam.nanos.notification.Notification',

    'java.util.*',

    'net.nanopay.test.TestReport'
  ],

  methods: [
    {
      name: 'generateNewReport',
      args: [
        {
          name: 'x', javaType: 'foam.core.X'
        }
      ],
      javaType: 'void',
      javaCode: `
long lastReport = getLastReport(x);

DAO testDAO = (DAO) x.get("testDAO");
ArraySink tests = (ArraySink) testDAO.select(new ArraySink());
List testArray = tests.getArray();

long totalTests = 0;
for(Test test : (List<Test>) testArray){
  totalTests += test.getPassed() + test.getFailed();
}

DAO reportsDAO = (DAO) x.get("testReportDAO");
TestReport newReport = new TestReport.Builder(x)
  .setTime(new Date())
  .setTotalTests(totalTests)
  .build();
reportsDAO.put(newReport);

pushNotification(x, lastReport, totalTests);`
    },
    {
      name: 'getLastReport',
      args: [
        {
          name: 'x', javaType: 'foam.core.X'
        }
      ],
      javaType: 'long',
      javaCode: `
DAO reportsDAO = (DAO) x.get("testReportDAO");
ArraySink reports = (ArraySink) reportsDAO.select(new ArraySink());
List reportArray = reports.getArray();

if(reportArray.isEmpty()){
  return 0;
} else {
  TestReport report = (TestReport) reportArray.get(reportArray.size() - 1);
  return report.getTotalTests();
}`
    },
    {
      name: 'pushNotification',
      args: [
        {
          name: 'x', javaType: 'foam.core.X'
        },
        {
          name: 'lastReport', javaType: 'long'
        },
        {
          name: 'totalTests', javaType: 'long'
        }
      ],
      javaType: 'void',
      javaCode: `
String body = "=====Tests Summary=====\\n";
if(totalTests == lastReport){
  body += "_No tests were added or removed._\\n";
} else if (totalTests < lastReport){
  body += "*Tests Removed:* " + String.valueOf(lastReport - totalTests) + "\\n";
} else {
  body += "*Tests Added:* " + String.valueOf(totalTests - lastReport) + "\\n";
}
body += "*Total Tests:* " + String.valueOf(totalTests);

Notification notification = new Notification.Builder(x)
  .setTemplate("TestsReporter")
  .setBody(body)
  .build();
DAO notificationDAO = (DAO) x.get("notificationDAO");
notificationDAO.put(notification);`
    }
  ]
});
