import assert from "assert";
/**
    Convert 12.34 with a precision of 3 into 12340

    @arg {number|string} number - Use strings for large numbers.  This may contain one decimal but no sign
    @arg {number} precision - number of implied decimal places (usually causes right zero padding)
    @return {string} -
*/

var NumberUtils = {
  toImpliedDecimal: function toImpliedDecimal(number, precision) {
    if (typeof number === "number") {
      assert(number <= 9007199254740991, "overflow");
      number = "" + number;
    } else if (number.toString) number = number.toString();

    assert(typeof number === "string", "number should be an actual number or string: " + typeof number);
    number = number.trim();
    assert(/^[0-9]*\.?[0-9]*$/.test(number), "Invalid decimal number " + number);

    var _number$split = number.split("."),
        _number$split$ = _number$split[0],
        whole = _number$split$ === void 0 ? "" : _number$split$,
        _number$split$2 = _number$split[1],
        decimal = _number$split$2 === void 0 ? "" : _number$split$2;

    var padding = precision - decimal.length;
    assert(padding >= 0, "Too many decimal digits in " + number + " to create an implied decimal of " + precision);

    for (var i = 0; i < padding; i++) {
      decimal += "0";
    }

    while (whole.charAt(0) === "0") {
      whole = whole.substring(1);
    }

    return whole + decimal;
  }
};
export default NumberUtils;