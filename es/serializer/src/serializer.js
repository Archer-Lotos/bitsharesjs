import ByteBuffer from "bytebuffer";
import EC from "./error_with_cause";

var Buffer = require("safe-buffer").Buffer;

var HEX_DUMP = process.env.npm_config__graphene_serializer_hex_dump;

var Serializer = /*#__PURE__*/function () {
  function Serializer(operation_name, types) {
    this.operation_name = operation_name;
    this.types = types;
    if (this.types) this.keys = Object.keys(this.types);
    Serializer.printDebug = true;
  }

  var _proto = Serializer.prototype;

  _proto.fromByteBuffer = function fromByteBuffer(b) {
    var object = {};
    var field = null;

    try {
      var iterable = this.keys;

      for (var i = 0, field; i < iterable.length; i++) {
        field = iterable[i];
        var type = this.types[field];

        try {
          if (HEX_DUMP) {
            if (type.operation_name) {
              console.error(type.operation_name);
            } else {
              var o1 = b.offset;
              type.fromByteBuffer(b);
              var o2 = b.offset;
              b.offset = o1; //b.reset()

              var _b = b.copy(o1, o2);

              console.error(this.operation_name + "." + field + "\t", _b.toHex());
            }
          }

          object[field] = type.fromByteBuffer(b);
        } catch (e) {
          if (Serializer.printDebug) {
            console.error("Error reading " + this.operation_name + "." + field + " in data:");
            b.printDebug();
          }

          throw e;
        }
      }
    } catch (error) {
      EC["throw"](this.operation_name + "." + field, error);
    }

    return object;
  };

  _proto.appendByteBuffer = function appendByteBuffer(b, object) {
    var field = null;

    try {
      var iterable = this.keys;

      for (var i = 0, field; i < iterable.length; i++) {
        field = iterable[i];
        var type = this.types[field];
        type.appendByteBuffer(b, object[field]);
      }
    } catch (error) {
      try {
        EC["throw"](this.operation_name + "." + field + " = " + JSON.stringify(object[field]), error);
      } catch (e) {
        // circular ref
        EC["throw"](this.operation_name + "." + field + " = " + object[field], error);
      }
    }

    return;
  };

  _proto.fromObject = function fromObject(serialized_object) {
    var result = {};
    var field = null;

    try {
      var iterable = this.keys;

      for (var i = 0, field; i < iterable.length; i++) {
        field = iterable[i];
        var type = this.types[field];
        var value = serialized_object[field]; //DEBUG value = value.resolve if value.resolve
        //DEBUG console.log('... value',field,value)

        var object = type.fromObject(value);
        result[field] = object;
      }
    } catch (error) {
      EC["throw"](this.operation_name + "." + field, error);
    }

    return result;
  }
  /**
      @arg {boolean} [debug.use_default = false] - more template friendly
      @arg {boolean} [debug.annotate = false] - add user-friendly information
  */
  ;

  _proto.toObject = function toObject(serialized_object, debug) {
    if (serialized_object === void 0) {
      serialized_object = {};
    }

    if (debug === void 0) {
      debug = {
        use_default: false,
        annotate: false
      };
    }

    var result = {};
    var field = null;

    try {
      if (!this.types) return result;
      var iterable = this.keys;

      for (var i = 0, field; i < iterable.length; i++) {
        field = iterable[i];
        var type = this.types[field];
        var object = type.toObject(typeof serialized_object !== "undefined" && serialized_object !== null ? serialized_object[field] : undefined, debug);
        result[field] = object;

        if (HEX_DUMP) {
          var b = new ByteBuffer(ByteBuffer.DEFAULT_CAPACITY, ByteBuffer.LITTLE_ENDIAN);
          type.appendByteBuffer(b, typeof serialized_object !== "undefined" && serialized_object !== null ? serialized_object[field] : undefined);
          b = b.copy(0, b.offset);
          console.error(this.operation_name + "." + field, b.toHex());
        }
      }
    } catch (error) {
      EC["throw"](this.operation_name + "." + field, error);
    }

    return result;
  }
  /** Sort by the first element in a operation */
  ;

  _proto.compare = function compare(a, b) {
    var first_key = this.keys[0];
    var first_type = this.types[first_key];
    var valA = a[first_key];
    var valB = b[first_key];
    if (first_type.compare) return first_type.compare(valA, valB);
    if (typeof valA === "number" && typeof valB === "number") return valA - valB;
    var encoding;

    if (Buffer.isBuffer(valA) && Buffer.isBuffer(valB)) {
      // A binary string compare does not work.  If localeCompare is well supported that could replace HEX.  Performanance is very good so comparing HEX works.
      encoding = "hex";
    }

    var strA = valA.toString(encoding);
    var strB = valB.toString(encoding);
    return strA > strB ? 1 : strA < strB ? -1 : 0;
  } // <helper_functions>
  ;

  _proto.fromHex = function fromHex(hex) {
    var b = ByteBuffer.fromHex(hex, ByteBuffer.LITTLE_ENDIAN);
    return this.fromByteBuffer(b);
  };

  _proto.fromBuffer = function fromBuffer(buffer) {
    var b = ByteBuffer.fromBinary(buffer.toString("binary"), ByteBuffer.LITTLE_ENDIAN);
    return this.fromByteBuffer(b);
  };

  _proto.toHex = function toHex(object) {
    // return this.toBuffer(object).toString("hex")
    var b = this.toByteBuffer(object);
    return b.toHex();
  };

  _proto.toByteBuffer = function toByteBuffer(object) {
    var b = new ByteBuffer(ByteBuffer.DEFAULT_CAPACITY, ByteBuffer.LITTLE_ENDIAN);
    this.appendByteBuffer(b, object);
    return b.copy(0, b.offset);
  };

  _proto.toBuffer = function toBuffer(object) {
    return Buffer.from(this.toByteBuffer(object).toBinary(), "binary");
  };

  return Serializer;
}();

export default Serializer;