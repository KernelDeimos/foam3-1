package net.nanopay.tx.bmo;

import org.apache.commons.lang3.StringUtils;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Date;

public class BmoFormatUtil {

  public static String getCurrentJulianDateEDT() {
    return toJulianDateEDT(Instant.now());
  }

  public static String toJulianDateEDT(Instant instant) {
    ZonedDateTime est = instant.atZone(ZoneId.of("America/Toronto"));
    return "0"
      + String.valueOf(est.getYear() % 100)
      + addLeftZeros(est.getDayOfYear(), 3);
  }

  public static String getCurrentDateTimeEDT() {
    ZonedDateTime est = ZonedDateTime.now(ZoneId.of("America/Toronto"));
    return est.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
  }

  public static String addLeftZeros(long number, int size) {
    return addLeftZeros(String.valueOf(number), size);
  }

  public static String addLeftZeros(int number, int size) {
    return addLeftZeros(String.valueOf(number), size);
  }

  public static String addLeftZeros(String str, int size) {
    return StringUtils.leftPad(str, size, "0");
  }

  public static String addRightBlanks(String str, int size) {
    return StringUtils.rightPad(str, size, " ");
  }

  public static String blanks(int size) {
    return StringUtils.rightPad("", size, " ");
  }

  public static String fieldAt(String target, int position) {
    return target.substring(position - 1, position);
  }

  public static String fieldAt(String target, int start, int end) {
    return target.substring(start -1 , end);
  }

  public static ArrayList<String> splitRecord(String records) {
    int size = 240;
    int index = 0;
    ArrayList<String> result = new ArrayList<>();
    while ( index < records.length()) {
      result.add(records.substring(index, index + size));
      index = index + size;
    }
    return result;
  }


}
