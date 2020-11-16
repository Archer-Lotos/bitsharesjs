import PrivateKey from "../../ecc/src/PrivateKey";
import key from "../../ecc/src/KeyUtils";
import { get, set } from "./state";
var _keyCachePriv = {};
var _keyCachePub = {};

var AccountLogin = /*#__PURE__*/function () {
  function AccountLogin() {
    var state = {
      loggedIn: false,
      roles: ["active", "owner", "memo"]
    };
    this.get = get(state);
    this.set = set(state);
    this.subs = {};
  }

  var _proto = AccountLogin.prototype;

  _proto.addSubscription = function addSubscription(cb) {
    this.subs[cb] = cb;
  };

  _proto.setRoles = function setRoles(roles) {
    this.set("roles", roles);
  };

  _proto.generateKeys = function generateKeys(accountName, password, roles, prefix) {
    var start = new Date().getTime();

    if (!accountName || !password) {
      throw new Error("Account name or password required");
    }

    if (password.length < 12) {
      throw new Error("Password must have at least 12 characters");
    }

    var privKeys = {};
    var pubKeys = {};
    (roles || this.get("roles")).forEach(function (role) {
      var seed = accountName + role + password;
      var pkey = _keyCachePriv[seed] ? _keyCachePriv[seed] : PrivateKey.fromSeed(key.normalize_brainKey(seed));
      _keyCachePriv[seed] = pkey;
      privKeys[role] = pkey;
      pubKeys[role] = _keyCachePub[seed] ? _keyCachePub[seed] : pkey.toPublicKey().toString(prefix);
      _keyCachePub[seed] = pubKeys[role];
    });
    return {
      privKeys: privKeys,
      pubKeys: pubKeys
    };
  };

  _proto.checkKeys = function checkKeys(_ref) {
    var _this = this;

    var accountName = _ref.accountName,
        password = _ref.password,
        auths = _ref.auths;

    if (!accountName || !password || !auths) {
      throw new Error("checkKeys: Missing inputs");
    }

    var hasKey = false;

    var _loop = function _loop(role) {
      var _this$generateKeys = _this.generateKeys(accountName, password, [role]),
          privKeys = _this$generateKeys.privKeys,
          pubKeys = _this$generateKeys.pubKeys;

      auths[role].forEach(function (key) {
        if (key[0] === pubKeys[role]) {
          hasKey = true;

          _this.set(role, {
            priv: privKeys[role],
            pub: pubKeys[role]
          });
        }
      });
    };

    for (var role in auths) {
      _loop(role);
    }

    if (hasKey) {
      this.set("name", accountName);
    }

    this.set("loggedIn", hasKey);
    return hasKey;
  };

  _proto.signTransaction = function signTransaction(tr) {
    var _this2 = this;

    var myKeys = {};
    var hasKey = false;
    this.get("roles").forEach(function (role) {
      var myKey = _this2.get(role);

      if (myKey) {
        hasKey = true;
        console.log("adding signer:", myKey.pub);
        tr.add_signer(myKey.priv, myKey.pub);
      }
    });

    if (!hasKey) {
      throw new Error("You do not have any private keys to sign this transaction");
    }
  };

  return AccountLogin;
}();

var accountLogin = new AccountLogin();
export default accountLogin;