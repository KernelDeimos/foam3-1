foam.CLASS({
  name: 'TransactionRow',

  properties: [
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.tx.model.Transaction',
      name: 'transaction',
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.User',
      name: 'user',
    },
    {
      class: 'String',
      name: 'fullName',
      swiftView: 'foam.swift.ui.FOAMUILabel',
      swiftExpressionArgs: ['user$firstName', 'user$lastName'],
      swiftExpression: `
let f = (user$firstName as? String) ?? ""
let l = (user$lastName as? String) ?? ""
return f + " " + l
      `,
    },
    {
      class: 'String',
      name: 'date',
      swiftView: 'foam.swift.ui.FOAMUILabel',
      swiftExpressionArgs: ['transaction$date'],
      swiftExpression: `
var d: String!

guard let rawD = (transaction$date as? Date) else {
  return "Date failed to convert"
}

let convFormatter = DateFormatter()
convFormatter.dateFormat = "dd MMM yyyy, hh:mma"

let seconds = TimeZone.autoupdatingCurrent.secondsFromGMT(for: rawD);
let localTime = Date(timeInterval: TimeInterval(seconds), since: rawD);

d = convFormatter.string(from: localTime)

return d
      `,
    },
    {
      class: 'String',
      name: 'amount',
      swiftView: 'foam.swift.ui.FOAMUILabel',
      swiftExpressionArgs: ['transaction$amount'],
      swiftExpression: `
guard let amount = transaction$amount as? Int else {
  return "ERROR " + String(describing: transaction$amount)
}
// TODO: Do the +/-
return "$" + String(format: "%.2f", Float(amount)/100)
      `,
    },
    {
      class: 'String',
      name: 'initials',
      swiftView: 'foam.swift.ui.FOAMUILabel',
      swiftExpressionArgs: ['user$firstName', 'user$lastName'],
      swiftExpression: `
let f = (user$firstName as? String) ?? ""
let l = (user$lastName as? String) ?? ""
let fc = f.count > 0 ? String(f.char(at: 0)) : ""
let lc = l.count > 0 ? String(l.char(at: 0)) : ""
return "\\(fc)\\(lc)"
      `,
    },
    {
      swiftType: 'UIColor',
      name: 'amountColor',
      swiftExpressionArgs: ['transaction$amount'],
      swiftExpression: `
guard let amount = transaction$amount as? Int else {
  return UIColor.red
}
// TODO: Do this properly.
if amount > 1000 {
  return UIColor.green
} else {
  return UIColor.red
}
      `,
    },
  ]
});
