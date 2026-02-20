#!/usr/bin/env node
/* Copyright 2018-2024 ComdivByZero
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var o7;
(function(o7) { "use strict";

  var utf8Enc, utf8Dec, u8array, toUtf8, utf8Cache, utf8ToStr, proc;

  utf8Cache = [];

  o7.export = {};
  o7.import = o7.export;

  if (typeof process === 'undefined' || !process.exit) {
    proc = {exit : function(code) { if (code != 0) throw code; }};
  } else {
    proc = process;
  }

  function assert(check, msg) {
    if (check) {
      ;
    } else if (msg) {
      throw new Error(msg);
    } else {
      throw new Error("assertion is false");
    }
  }
  o7.assert = assert;

  function indexOut(index, array) {
    return new RangeError("array index - " + index + " out of bounds - 0 .. " + (array.length - 1));
  }

  function array() {
    var lens;

    lens = arguments;
    function create(li) {
      var a, len, i;

      len = lens[li];
      a = new Array(len);
      li += 1;
      if (li < lens.length) {
        for (i = 0; i < len; i += 1) {
          a[i] = create(li);
        }
      }
      return a;
    }
    return create(0);
  }
  o7.array = array;

  function arrayOfRec() {
    var lens, lim, rec;

    lens = arguments;
    lim = lens.length - 1;
    rec = lens[lim];
    function create(li) {
      var a, len, i;

      len = lens[li];
      a = new Array(len);
      li += 1;
      if (li < lim) {
        for (i = 0; i < len; i += 1) {
          a[i] = create(li);
        }
      } else {
        for (i = 0; i < len; i += 1) {
          a[i] = new rec();
        }
      }
      return a;
    }
    return create(0);
  }
  o7.arrayOfRec = arrayOfRec;


  Array.prototype.at = function(index) {
    if (0 <= index && index < this.length) {
      return this[index];
    } else {
      throw indexOut(index, this);
    }
  };
  Array.prototype.put = function(index, val) {
    if (0 <= index && index < this.length) {
      this[index] = val;
    } else {
      throw indexOut(index, this);
    }
  };
  Array.prototype.inc = function(index, val) {
    if (0 <= index && index < this.length) {
      this[index] = add(this[index], val);
    } else {
      throw indexOut(index, this);
    }
  };
  Array.prototype.incl = function(index, val) {
    if (0 <= index && index < this.length) {
      this[index] |= incl(val);
    } else {
      throw indexOut(index, this);
    }
  };
  Array.prototype.excl = function(index, val) {
    if (0 <= index && index < this.length) {
      this[index] &= excl(val);
    } else {
      throw indexOut(index, this);
    }
  };

  o7.at = function(array, index) {
    if (0 <= index && index < array.length) {
      return array[index];
    } else {
      throw indexOut(index, array);
    }
  };

  o7.put = function(array, index, value) {
    if (0 <= index && index < array.length) {
      array[index] = value;
    } else {
      throw indexOut(index, array);
    }
  };

  function ind(index, length) {
    if (0 <= index && index < length) {
      return value;
    } else {
      throw indexOut(index, length);
    }
  }
  o7.ind = ind;

  o7.caseFail = function(val) {
    throw new RangeError("Unexpected value in case = " + val);
  };

  o7.cti = function(char) {
    return char.charCodeAt(0);
  };

  o7.itc = function(int) {
    if (0 <= int && int < 0x100) {
      return int;
    } else {
      throw new RangeError("Char range overflow during cast from " + int);
    }
  };

  o7.bti = function(bool) {
    var i;
    if (bool) {
      i = 1;
    } else {
      i = 0;
    }
    return i;
  };

  o7.sti = function(bitset) {
    if (0 <= bitset && bitset < 0x80000000) {
      return bitset;
    } else {
      throw new RangeError("Set " + bitset + " can not be converted to integer");
    }
  };

  o7.itb = function(int) {
    if (0 <= int && int < 0x100) {
      return int;
    } else {
      throw new RangeError("Byte range is overflowed during cast from " + int);
    }
  };

  o7.floor = function(double) {
    var v;
    v = Math.floor(double);
    if ((-0x80000000 < v) && (v < 0x80000000)) {
      return v;
    } else {
      throw new RangeError("floor overflow " + v);
    }
  };

  o7.flt = function(int) {
    /* TODO */
    return int;
  };

  o7.scalb = function(double, int) {
    /* TODO */
    return double * Math.pow(2, int);
  };

  o7.frexp = function(d, n, n_i) {
    /* TODO */
    var abs, exp, x;
    if (d !== 0.0) {
      abs = Math.abs(d);
      exp = Math.max(-1023, Math.floor(Math.log(abs) * Math.LOG2E) + 1);
      x = abs * Math.pow(2, -exp);

      while (x < 1.0) {
        x   *= 2.0;
        exp -= 1;
      }
      while (x >= 2.0) {
        x   /= 2.0;
        exp += 1;
      }
      if (d < 0.0) {
        x = -x;
      }
      n[n_i] = exp;
    } else {
      x      = 0.0;
      n[n_i] = 0.0;
    }
    return x;
  }

  o7.in = function(n, st) {
    assert((0 <= n) && (n <= 31));
    return 0 != (st & (1 << n));
  };

  if (typeof Uint8Array !== 'undefined') {
    Uint8Array.prototype.at = Array.prototype.at;
    Uint8Array.prototype.put = Array.prototype.put;
    u8array = function(array) {
      return new Uint8Array(array);
    }
  } else {
    u8array = function(array) {
      return array;
    };
  }

  function arrayUtf8ToStr(bytes) {
    var str, buf, i, len, ch, ch1, ch2, ch3, ok;

    buf = [];
    len = bytes.length;
    i = 0;
    ok = true;
    while (i < len && bytes[i] != 0) {
      ch = bytes[i];
      i += 1;
      if (ch < 0x80) {
        buf.push(String.fromCharCode(ch));
      } else if (ch < 0xC0) {
        ok = false;
      } else if (ch < 0xE0) {
        if (i < len) {
          ch1 = bytes[i];
          i += 1;
          if ((ch1 >> 6) == 2) {
            buf.push(String.fromCharCode(((ch & 0x1F) << 6) | (ch1 & 0x3F)));
          } else {
            ok = false;
          }
        } else {
          ok = false;
        }
      } else if (ch < 0xF0) {
        if (i + 1 < len) {
          ch1 = bytes[i];
          ch2 = bytes[i + 1];
          i += 2;
          if (((ch1 >> 6) == 2) && ((ch2 >> 6) == 2)) {
            buf.push(String.fromCharCode(((ch & 0xF) << 12) | ((ch1 & 0x3F) << 6) | (ch2 & 0x3F)));
          } else {
            ok = false;
          }
        } else {
          ok = false;
        }
      } else {
        if (i + 2 < len) {
          ch1 = bytes[i];
          ch2 = bytes[i + 1];
          ch3 = bytes[i + 2];
          i += 3;
          if (((ch1 >> 6) == 2) && ((ch2 >> 6) == 2) && ((ch3 >> 6) == 2)) {
            buf.push(String.fromCodePoint(((ch & 0x7) << 18) | ((ch1 & 0x3F) << 12) | ((ch2 & 0x3F) << 6) | (ch3 & 0x3F)));
          } else {
            ok = false;
          }
        } else {
          ok = false;
        }
      }
    }
    if (ok) {
      str = buf.join('');
    } else {
      str = null;
    }
    return str;
  };

  if (typeof TextDecoder !== 'undefined') {
    utf8Enc = new TextEncoder('utf-8');
    utf8Dec = new TextDecoder('utf-8');

    if (utf8Enc.encode("!").push) {
      toUtf8 = function(str) {
        var a;
        a = utf8Enc.encode(str);
        a.push(0);
        return u8array(a);
      };
    } else {
      toUtf8 = function(str) {
        var a, b;
        a = utf8Enc.encode(str);
        b = new Uint8Array(a.length + 1);
        b.set(a, 0);
        b[a.length] = 0;
        return u8array(b);
      };
    }

    utf8ToStr = function(bytes) {
      var str;
      if (bytes instanceof Uint8Array) {
        str = utf8Dec.decode(bytes);
      } else {
        str = arrayUtf8ToStr(bytes);
      }
      return str;
    };
  } else {
    /* str must be correct utf16 string */
    toUtf8 = function(str) {
      var bytes, si, ch, len;
      bytes = [];
      si = 0;
      len = str.length;
      while (si < len) {
        ch = str.charCodeAt(si);
        if (ch < 0x80) {
          bytes.push(ch);
        } else if (ch < 0x800) {
          bytes.push((ch >> 6) | 0xC0,
                     (ch & 0x3F) | 0x80);
        } else if ((ch & 0xFC00) == 0xD800) {
          si += 1;
          ch = 0x10000 | ((ch & 0x3FF) << 10) | (str.charCodeAt(si) & 0x3FF);
          bytes.push((ch >> 18) | 0xF0,
                     ((ch >> 12) & 0x3F) | 0x80,
                     ((ch >> 6 ) & 0x3F) | 0x80,
                     (ch & 0x3F) | 0x80);
        } else {
          bytes.push((ch >> 12) | 0xE0,
                     ((ch >> 6) & 0x3F) | 0x80,
                     (ch & 0x3F) | 0x80);
        }
        si += 1;
      }
      bytes.push(0x0);
      return u8array(bytes);
    };

    utf8ToStr = arrayUtf8ToStr;
  }
  o7.utf8ToStr = utf8ToStr;

  o7.toUtf8 = function(str) {
    var utf;
    utf = utf8Cache[str];
    if (!utf) {
        utf = toUtf8(str);
        utf8Cache[str] = utf;
    }
    return utf;
  };

  o7.utf8ByOfsToStr = function(bytes, ofs) {
    if (ofs > 0) {
      bytes = bytes.slice(ofs);
    }
    return utf8ToStr(bytes);
  }

  /* str must be correct 7bit ASCII string */
  o7.toAscii = function(str) {
    var bytes, len, i;
    len = str.length;
    bytes = new Uint8Array(len);
    for (i = 0; i < len; i += 1) {
      /* assert str.charCodeAt(i) < 0x80 */
      bytes[i] = str.charCodeAt(i);
    }
    return bytes;
  };


  o7.extend = function(ext, base) {
    function proto() {}
    proto.prototype = base.prototype;

    ext.prototype = new proto();
    ext.base = base;
    return ext;
  };

  function add(a, b) {
    var r;
    r = a + b;
    if (-0x80000000 < r && r < 0x80000000) {
      return r;
    } else {
      throw new RangeError("integer overflow in " + a + " + " + b + " = " + r);
    }
  }
  o7.add = add;

  o7.sub = function(a, b) {
    var r;
    r = a - b;
    if (-0x80000000 < r && r < 0x80000000) {
      return r;
    } else {
      throw new RangeError("integer overflow in " + a + " - " + b + " = " + r);
    }
  };

  o7.mul = function(a, b) {
    var r;
    r = a * b;
    if (-0x80000000 < r && r < 0x80000000) {
      return r;
    } else {
      throw new RangeError("integer overflow in " + a + " * " + b + " = " + r);
    }
  };

  o7.div = function(a, b) {
    var mask;
    if (b > 0) {
      mask = a >> 31;
      return mask ^ ((mask ^ a) / b);
    } else {
      throw new RangeError("Integer divider can't be < 1");
    }
  };

  o7.mod = function(a, b) {
    var mask;
    if (b > 0) {
      mask = a >> 31;
      return (b & mask) + (mask ^ ((mask ^ a) % b));
    } else {
      throw new RangeError("Integer divider can't be < 1");
    }
  };

  function fadd(a, b) {
    var s;
    s = a + b;
    if (isFinite(s)) {
      return s;
    } else {
      /* TODO */
      throw new RangeError("Fraction out of range in " + a + " + " + b + " = " + s);
    }
  }
  o7.fadd = fadd;

  function fsub(a, b) {
    var s;
    s = a - b;
    if (isFinite(s)) {
      return s;
    } else {
      /* TODO */
      throw new RangeError("Fraction out of range in " + a + " - " + b + " = " + s);
    }
  }
  o7.fsub = fsub;

  function fmul(a, b) {
    var s;
    s = a * b;
    if (isFinite(s)) {
      return s;
    } else {
      /* TODO */
      throw new RangeError("Fraction out of range in " + a + " * " + b + " = " + s);
    }
  }
  o7.fmul = fmul;

  function fdiv(a, b) {
    var s;
    s = a / b;
    if (isFinite(s)) {
      return s;
    } else {
      /* TODO */
      throw new RangeError("Fraction out of range in " + a + " / " + b + " = " + s);
    }
  }
  o7.fdiv = fdiv;

  o7.set = function(low, high) {
    if (high > 31) {
      throw new RangeError("high limit = " + high + " > 31");
    } else if (high < 0) {
      throw new RangeError("high limit = " + high + " < 0");
    } else if (low > 31) {
      throw new RangeError("low limit = " + low + " > 31");
    } else if (low < 0) {
      throw new RangeError("low limit = " + low + " < 0");
    } else {
      return (~0 << low) & (~0 >>> (31 - high));
    }
  };

  function setRangeError(val) {
    return new RangeError("set item = " + val + " out of range 0 .. 31");
  }

  function incl(val) {
    if (0 <= val && val <= 31) {
      return 1 << val;
    } else {
      throw setRangeError(val);
    }
  }
  o7.incl = incl;

  function excl(val) {
    if (0 <= val && val <= 31) {
      return ~(1 << val);
    } else {
      throw setRangeError(val);
    }
  }
  o7.excl = excl;

  o7.ror = function(n, shift) {
    assert(n     >= 0);
    assert(shift >= 0);
    shift &= 31;
    n = (n >>> shift) | (n << (32 - shift));
    assert(n     >= 0);
    return n;
  }

  o7.asr = function(n, shift) {
    if (shift >= 31) { shift = 31; }
    else { assert(shift >= 0); }
    return n >> shift;
  }

  function inited(val) {
    if (isFinite(val)) {
      return val;
    } else {
      throw new RangeError("Uninitialized variable");
    }
  }
  o7.inited = inited;

  o7.cmp = function(a, b) {
    var d;
    d = a - b;
    if (isFinite(d)) {
      ;
    } else if (a < b) {
      d = -1;
    } else {
      inited(d);
    }
    return d;
  }

  o7.strcmp = function(s1, s2) {
    var i;
    i = 0;
    while ((s1[i] == s2[i]) && (s1[i] != 0)) {
      i += 1;
    }
    return inited(s1[i] - s2[i]);
  };

  function strchcmp(s1, c2) {
    var c1, ret;

    c1 = s1[0];
    ret = c1 - c2;
    if (ret != 0) {
      inited(ret);
    } else if (c1 != 0 && s1[1] != 0) {
      ret = inited(s1[1]);
    }
    return ret;
  }
  o7.strchcmp = strchcmp;

  o7.chstrcmp = function(c1, s2) {
    return -strchcmp(s2, c1);
  };

  /* Copy chars */
  o7.strcpy = function(d, s) {
    var len, i;

    len = s.length;
    assert(d.length >= len);
    for (i = 0; i < len; i += 1) {
      d[i] = s[i];
    }
    assert(d[len - 1] == 0);
  };

  o7.memcpy = function(d, di, s, si, len) {
    var lim;

    lim = di + len;
    assert(d.length >= lim);
    while (di < lim) {
      d[di] = s[si];
      di += 1; si += 1;
    }
  };

  function copy(d, s) {
    var i, len;
    len = s.length;
    assert(d.length >= len);
    if (Array.isArray(s[0])) {
      for (i = 0; i < len; i += 1) {
        copy(d[i], s[i]);
      }
    } else {
      for (i = 0; i < len; i += 1) {
        d[i] = s[i];
      }
    }
  }
  o7.copy = copy;

  function copyAor(d, s) {
    var i, len;
    len = s.length;
    assert(d.length >= len);
    if (Array.isArray(s[0])) {
      for (i = 0; i < len; i += 1) {
        copyAor(d[i], s[i]);
      }
    } else  {
      for (i = 0; i < len; i += 1) {
        d[i].assign(s[i]);
      }
    }
  }
  o7.copyAor = copyAor;

  o7.exit_code = 0;
  o7.main = function(main) {
    main();
    if (o7.exit_code != 0) {
      proc.exit(o7.exit_code);
    }
  };

}) (o7 || (o7 = {}));
/* Generated by Vostok - Oberon-07 translator */

/*  Base extensible records
 *  Copyright (C) 2016 ComdivByZero
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *)
(* база всего сущего, авось пригодится для чего-нибудь эдакого */
(function() { 'use strict';

var module = {};
o7.export.V = module;


function Message() {}
Message.prototype.assign = function(r) {
}
module.Message = Message;
module.Message = Message;

function Base() {
    Message.call(this);
    this.do_ = undefined;
}
o7.extend(Base, Message);
Base.prototype.assign = function(r) {
    this.do_ = r.do_;
}
module.Base = Base;
module.Base = Base;

function Error() {
    Base.call(this);
}
o7.extend(Error, Base);
Error.prototype.assign = function(r) {
    Base.prototype.assign.call(this, r);
}
module.Error = Error;
module.Error = Error;

function MsgFinalize() {
    Base.call(this);
}
o7.extend(MsgFinalize, Base);
MsgFinalize.prototype.assign = function(r) {
    Base.prototype.assign.call(this, r);
}
module.MsgFinalize = MsgFinalize;
module.MsgFinalize = MsgFinalize;
function MsgNeedMemory() {
    Base.call(this);
}
o7.extend(MsgNeedMemory, Base);
MsgNeedMemory.prototype.assign = function(r) {
    Base.prototype.assign.call(this, r);
}
module.MsgNeedMemory = MsgNeedMemory;
module.MsgNeedMemory = MsgNeedMemory;
function MsgCopy() {
    Base.call(this);
    this.copy = undefined;
}
o7.extend(MsgCopy, Base);
MsgCopy.prototype.assign = function(r) {
    Base.prototype.assign.call(this, r);
    this.copy = r.copy;
}
module.MsgCopy = MsgCopy;
module.MsgCopy = MsgCopy;
function MsgLinks() {
    Base.call(this);
    this.diff = NaN;
    this.count = NaN;
}
o7.extend(MsgLinks, Base);
MsgLinks.prototype.assign = function(r) {
    Base.prototype.assign.call(this, r);
    this.diff = r.diff;
    this.count = r.count;
}
module.MsgLinks = MsgLinks;
module.MsgLinks = MsgLinks;
function MsgHash() {
    Base.call(this);
    this.hash = NaN;
}
o7.extend(MsgHash, Base);
MsgHash.prototype.assign = function(r) {
    Base.prototype.assign.call(this, r);
    this.hash = r.hash;
}
module.MsgHash = MsgHash;
module.MsgHash = MsgHash;

function Nothing(this_, mes) {
    return false;
}

function Init(base) {
    base.do_ = Nothing;
}
module.Init = Init;

function SetDo(base, do_) {
    var nothing;

    nothing = Nothing;
    o7.assert(base.do_ == nothing);
    base.do_ = do_;
}
module.SetDo = SetDo;

function Do(handler, message) {
    return handler.do_(handler, message);
}
module.Do = Do;

return module;
})();

/* Generated by Vostok - Oberon-07 translator */

/* Abstract interfaces for data input and output
 *
 * Copyright (C) 2016-2019,2022-2023 ComdivByZero
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
(function() { 'use strict';
var V = o7.import.V;

var module = {};
o7.export.VDataStream = module;


function Stream() {
    V.Base.call(this);
    this.close = undefined;
}
o7.extend(Stream, V.Base);
Stream.prototype.assign = function(r) {
    V.Base.prototype.assign.call(this, r);
    this.close = r.close;
}
module.Stream = Stream;
module.Stream = Stream;
function In() {
    Stream.call(this);
    this.read = undefined;
    this.readChars = undefined;
}
o7.extend(In, Stream);
In.prototype.assign = function(r) {
    Stream.prototype.assign.call(this, r);
    this.read = r.read;
    this.readChars = r.readChars;
}
module.In = In;
module.In = In;
function InOpener() {
    V.Base.call(this);
    this.open = undefined;
}
o7.extend(InOpener, V.Base);
InOpener.prototype.assign = function(r) {
    V.Base.prototype.assign.call(this, r);
    this.open = r.open;
}
module.InOpener = InOpener;
module.InOpener = InOpener;
function Out() {
    Stream.call(this);
    this.write = undefined;
    this.writeChars = undefined;
}
o7.extend(Out, Stream);
Out.prototype.assign = function(r) {
    Stream.prototype.assign.call(this, r);
    this.write = r.write;
    this.writeChars = r.writeChars;
}
module.Out = Out;
module.Out = Out;
function OutOpener() {
    V.Base.call(this);
    this.open = undefined;
}
o7.extend(OutOpener, V.Base);
OutOpener.prototype.assign = function(r) {
    V.Base.prototype.assign.call(this, r);
    this.open = r.open;
}
module.OutOpener = OutOpener;
module.OutOpener = OutOpener;

function EmptyClose(stream) {
    o7.assert(stream instanceof Stream);
}

function Init(stream, close) {
    V.Init(stream);
    if (close == null) {
        stream.close = EmptyClose;
    } else {
        stream.close = close;
    }
}

function Close(stream) {
    if (stream != null) {
        stream.close(stream);
    }
}
module.Close = Close;

function InitIn(in_, read, readChars, close) {
    o7.assert((read != null) || (readChars != null));

    Init(in_, close);
    in_.read = read;
    in_.readChars = readChars;
}
module.InitIn = InitIn;

function CloseIn(in_, in__ai) {
    if (in_.at(in__ai) != null) {
        in_.at(in__ai).close(in_.at(in__ai));
        in_.put(in__ai, null);
    }
}
module.CloseIn = CloseIn;

function Read(in_, buf, ofs, count) {
    var r;

    o7.assert((0 <= ofs) && (0 <= count) && (ofs <= o7.sub(buf.length, count)));
    r = in_.read(in_, buf, ofs, count);
    o7.assert((0 <= r) && (r <= count));
    return r;
}
module.Read = Read;

function ReadWhole(in_, buf) {
    return Read(in_, buf, 0, buf.length);
}
module.ReadWhole = ReadWhole;

function ReadChars(in_, buf, ofs, count) {
    var r;

    o7.assert((0 <= ofs) && (0 <= count) && (ofs <= o7.sub(buf.length, count)));
    r = in_.readChars(in_, buf, ofs, count);
    o7.assert((0 <= r) && (r <= count));
    return r;
}
module.ReadChars = ReadChars;

function ReadCharsWhole(in_, buf) {
    return ReadChars(in_, buf, 0, buf.length);
}
module.ReadCharsWhole = ReadCharsWhole;

function Skip(in_, count) {
    function ByRead(in_, count) {
        var buf = o7.array(4096);
        var r;
        var read;

        read = in_.read;
        r = 4096;
        while ((count >= 4096) && (r == 4096)) {
            r = read(in_, buf, 0, 4096);
            count = o7.sub(count, r);
        }
        o7.assert((0 <= r) && (r <= 4096));
        if (count > 0) {
            r = read(in_, buf, 0, count);
            o7.assert((0 <= r) && (r <= count));
            count = o7.sub(count, r);
        }
        return count;
    }

    o7.assert(count >= 0);
    return o7.sub(count, ByRead(in_, count));
}
module.Skip = Skip;

function InitOut(out, write, writeChars, close) {
    o7.assert((write != null) || (writeChars != null));

    Init(out, close);
    out.write = write;
    out.writeChars = writeChars;
}
module.InitOut = InitOut;

function CloseOut(out, out__ai) {
    if (out.at(out__ai) != null) {
        out.at(out__ai).close(out.at(out__ai));
        out.put(out__ai, null);
    }
}
module.CloseOut = CloseOut;

function Write(out, buf, ofs, count) {
    var w;

    o7.assert((0 <= ofs) && (0 <= count) && (ofs <= o7.sub(buf.length, count)));
    w = out.write(out, buf, ofs, count);
    o7.assert((0 <= w) && (w <= count));
    return w;
}
module.Write = Write;

function WriteChars(out, buf, ofs, count) {
    var w;

    o7.assert((0 <= ofs) && (0 <= count) && (ofs <= o7.sub(buf.length, count)));
    w = out.writeChars(out, buf, ofs, count);
    o7.assert((0 <= w) && (w <= count));
    return w;
}
module.WriteChars = WriteChars;

function WriteCharsWhole(out, buf) {
    return WriteChars(out, buf, 0, buf.length);
}
module.WriteCharsWhole = WriteCharsWhole;

function InitInOpener(opener, open) {
    o7.assert(open != null);
    V.Init(opener);
    opener.open = open;
}
module.InitInOpener = InitInOpener;

function InitOutOpener(opener, open) {
    o7.assert(open != null);
    V.Init(opener);
    opener.open = open;
}
module.InitOutOpener = InitOutOpener;

/* TODO проработать ошибки операций */
function OpenIn(opener) {
    return opener.open(opener);
}
module.OpenIn = OpenIn;

function OpenOut(opener) {
    return opener.open(opener);
}
module.OpenOut = OpenOut;

return module;
})();

/* Copyright 2019-2021,2023,2025-2026 ComdivByZero
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
(function() { 'use strict';

var module = {};
o7.export.CFiles = module;

var getjsa, utf8ByOfsToStr, fs, proc;

var KiB = 1024;
module.KiB = KiB;
var MiB = 1024 * KiB;
module.MiB = MiB;
var GiB = 1024 * MiB;
module.GiB = GiB;

function File() {}
File.prototype.assign = function(r) {}

utf8ByOfsToStr = o7.utf8ByOfsToStr;

if (typeof require !== 'undefined' && typeof process !== 'undefined') {
	fs = require('fs');
} else {
	fs = null;
}

function wrapFile1(file) {
	var f;
	f = new File();
	f.fd = file.fd;
	f.notsync = true;
	return f;
}

/* TODO сохранение буфера до Сlose */
function bufGet(size) {
	var data;
	if (Buffer.allocUnsafe) {
		data = Buffer.allocUnsafe(size);
	} else {
		data = new Buffer(size);
	}
	return data;
}

function wrapFile2(file) {
	var f;
	f = new File();
	f.f = file;
	return f;
}


if (fs != null) {
	module.in_ = wrapFile1(process.stdin);
	module.out = wrapFile1(process.stdout);
	module.err = wrapFile1(process.stderr);

	module.Open = function(bytes_name, ofs, mode) {
		var f, name, fd, smode, i;

		f = null;
		name = utf8ByOfsToStr(bytes_name, ofs);
		if (name != null) {
			smode = "r";
			/* TODO */
			for (i = mode.length - 1; i >= 0; i -= 1) {
				if (mode[i] == 0x77) {
					smode = "w+";
				} else if (mode[i] == 0x61) {
					smode = "a";
				}
			}
			try {
				fd = fs.openSync(name, smode, 6 * 64 + 6 * 8 + 6);
			} catch {
				fd = -1;
			}
			if (fd != -1) {
				f = new File();
				f.fd = fd;
			}
		}
		return f;
	}

	module.Close = function(file, file_ai) {
		if (file[file_ai]) {
			fs.closeSync(file[file_ai].fd);
			file[file_ai] = null;
		}
	}

	function tryRead(file, buf, ofs, count) {
		var read;
		try {
			read = fs.readSync(file.fd, buf, ofs, count, null);
		} catch {
			read = 0;
		}
		return read;
	}

	module.Read = function(file, buf, ofs, count) {
		var data, read, i;
		if (typeof buf !== 'Uint8Array') {
			data = bufGet(count);
			read = tryRead(file, data, 0, count);
			for (i = 0; i < read; i += 1) {
				buf[i + ofs] = data[i];
			}
		} else {
			read = tryRead(file, buf, ofs, count);
		}
		return read;
	}

	module.Write = function(file, buf, ofs, count) {
		var data, write, i;
		if (typeof buf !== 'Uint8Array') {
			data = bufGet(count);
			for (i = 0; i < count; i += 1) {
				data[i] = buf[i + ofs];
			}
			ofs = 0;
		} else {
			data = buf;
		}
		try {
			write = fs.writeSync(file.fd, data, ofs, count);
		} catch {
			write = 0;
		}
		return write;
	}

	module.Flush = function(file) {
		return file.notsync || 0 === fs.fdatasyncSync(file.fd);
	}

	module.Remove = function(name, ofs) {
		var str, ok;
		str = utf8ByOfsToStr(name, ofs);
		ok = str != null;
		if (ok) {
			try {
				fs.unlinkSync(str);
			} catch {
				ok = false;
			}
		}
		return str != null;
	}

	module.Exist = function(name, ofs) {
		var str;
		str = utf8ByOfsToStr(name, ofs);
		return str != null && fs.existsSync(str);
	}

	module.Rename = function(src, sofs, dest, dofs) {
		var s, d, ok;
		s = utf8ByOfsToStr(src, sofs);
		d = utf8ByOfsToStr(dest, dofs);
		ok = (s != null) && (d != null);
		if (ok) {
			try {
				fs.renameSync(s, d);
			} catch {
				ok = false;
			}
		}
		return ok;
	}

} else if (typeof std !== 'undefined') {
	module.in_ = wrapFile2(std.in);
	module.out = wrapFile2(std.out);
	module.err = wrapFile2(std.err);

	module.Open = function(bytes_name, ofs, mode) {
		var f, name, file, smode;

		f = null;
		name = utf8ByOfsToStr(bytes_name, ofs);
		smode = utf8ByOfsToStr(mode, 0);
		if (name != null && smode != null) {
			file = std.open(name, smode);
			if (file != null) {
				f = new File();
				f.f = file;
			}
		}
		return f;
	}

	module.Close = function(file, file_ai) {
		if (file[file_ai]) {
			file[file_ai].f.close();
			file[file_ai] = null;
		}
	}

	module.Read = function(file, buf, ofs, count) {
		var data, read, i;
		data = new ArrayBuffer(count);
		read = file.f.read(data, 0, count);
		if (read > 0) {
			data = new Uint8Array(data);
			for (i = 0; i < read; i += 1) {
				buf[i + ofs] = data[i];
			}
		}
		return read;
	}

	module.Write = function(file, buf, ofs, count) {
		var ab, data, i;
		ab = new ArrayBuffer(count);
		data = new Uint8Array(ab);
		for (i = 0; i < count; i += 1) {
			data[i] = buf[i + ofs];
		}
		return file.f.write(ab, 0, count);
	}

	module.Flush = function(file) { return file.flush() == 0; }

	module.Remove = function(name, ofs) {
		var str;
		str = utf8ByOfsToStr(name, ofs);
		return (str != null) && (os.remove(str) == 0);
	}

	module.Exist = function(name, ofs) {
		var name, f;
		name = utf8ByOfsToStr(name, ofs);
		f = null;
		if (name != null) {
			f = std.open(name, "rb");
			if (f != null) {
				f.close();
			}
		}
		return f != null;
	}

	module.Seek = function(file, gibs, bytes) {
		o7.assert(gibs >= 0);
		o7.assert(bytes >= 0 && bytes <= GiB);
		return 0 == file.seek(BigInt(gibs) * BigInt(GiB) + BigInt(bytes), std.SEEK_SET);
	}

	module.Tell = function(file, gibs, gibs_ai, bytes, bytes_ai) {
		var pos, ok;
		pos = file.tello();
		ok = pos >= BigInt(0);
		if (ok) {
			gibs[gibs_ai] = Number(pos / BigInt(GiB));
			bytes[bytes_ai] = Number(pos % BigInt(GiB));
		}
		return ok;
	}

	module.Rename = function(src, sofs, dest, dofs) {
		var s, d;
		s = utf8ByOfsToStr(src, sofs);
		d = utf8ByOfsToStr(dest, dofs);
		return 0 == os.rename(s, d);
	}

} else {
	module.in_ = new File();
	module.out = new File();
	module.err = new File();

	module.Open = function(bytes_name, ofs, mode) { return null; }
	module.Close = function(file, file_ai) {}
	module.Read = function(file, buf, ofs, count) { return 0; }
	module.Write = function(file, buf, ofs, count) { return 0; }
	module.Flush = function(file) { return false; }
	module.Remove = function(name, ofs)  { return false; }
	module.Exist = function(name, ofs) { return false; }
	module.Rename = function(src, sofs, dest, dofs) { return false; }
}

module.ReadChars = function(file, buf, ofs, count) {
	return module.Read(file, buf, ofs, count);
}
module.WriteChars = function(file, buf, ofs, count) {
	return module.Write(file, buf, ofs, count);
}

if (!module.Seek) {
	module.Seek = function(file, gibs, bytes) { return false; };
	module.Tell = function(file, gibs, gibs_ai, bytes, bytes_ai) { return false; };
}

return module;
})();
/* Generated by Vostok - Oberon-07 translator */

/* Implementations of Data Stream interfaces by CFiles
 *
 * Copyright (C) 2016,2019,2021-2022 ComdivByZero
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
(function() { 'use strict';
var V = o7.import.V;
var Stream = o7.import.VDataStream;
var CFiles = o7.import.CFiles;

var module = {};
o7.export.VFileStream = module;


function RIn() {
    Stream.In.call(this);
    this.file = o7.array(1);
}
o7.extend(RIn, Stream.In);
RIn.prototype.assign = function(r) {
    Stream.In.prototype.assign.call(this, r);
    o7.copy(this.file, r.file);
}
module.RIn = RIn;
function ROut() {
    Stream.Out.call(this);
    this.file = o7.array(1);
}
o7.extend(ROut, Stream.Out);
ROut.prototype.assign = function(r) {
    Stream.Out.prototype.assign.call(this, r);
    o7.copy(this.file, r.file);
}
module.ROut = ROut;

var out = undefined;
module.out = out;
var in_ = undefined;
module.in_ = in_;

function Read(i, buf, ofs, count) {
    return CFiles.Read(i.file[0], buf, ofs, count);
}

function ReadChars(i, buf, ofs, count) {
    return CFiles.ReadChars(i.file[0], buf, ofs, count);
}

function CloseRIn(i) {
    CFiles.Close(i.file, 0);
}

function OpenIn(name) {
    var i;
    var file;

    i = new RIn();
    if (i != null) {
        file = CFiles.Open(name, 0, [114,98,0]);
        if (file == null) {
            i = null;
        } else {
            Stream.InitIn(i, Read, ReadChars, CloseRIn);
            i.file[0] = file;
        }
    }
    return i;
}
module.OpenIn = OpenIn;

function CloseIn(i, i__ai) {
    if (i.at(i__ai) != null) {
        if (i.at(i__ai) != module.in_) {
            CFiles.Close(i.at(i__ai).file, 0);
        }
        i.put(i__ai, null);
    }
}
module.CloseIn = CloseIn;

function Write(o, buf, ofs, count) {
    return CFiles.Write(o.file[0], buf, ofs, count);
}

function WriteChars(o, buf, ofs, count) {
    return CFiles.WriteChars(o.file[0], buf, ofs, count);
}

function CloseROut(o) {
    CFiles.Close(o.file, 0);
}

function OpenOutFile(name, attr) {
    var o;
    var file;

    o = new ROut();
    if (o != null) {
        file = CFiles.Open(name, 0, attr);
        if (file == null) {
            o = null;
        } else {
            Stream.InitOut(o, Write, WriteChars, CloseROut);
            o.file[0] = file;
        }
    }
    return o;
}

function OpenOut(name) {
    return OpenOutFile(name, [119,98,0]);
}
module.OpenOut = OpenOut;

function OpenForAppend(name) {
    return OpenOutFile(name, [97,98,0]);
}
module.OpenForAppend = OpenForAppend;

function CloseOut(o, o__ai) {
    if (o.at(o__ai) != null) {
        if (o.at(o__ai) != module.out) {
            CFiles.Close(o.at(o__ai).file, 0);
        }
        o.put(o__ai, null);
    }
}
module.CloseOut = CloseOut;

function WrapOut() {
    module.out = new ROut();
    if (module.out != null) {
        Stream.InitOut(module.out, Write, WriteChars, null);
        module.out.file[0] = CFiles.out;
    }
}

function WrapIn() {
    module.in_ = new RIn();
    if (module.in_ != null) {
        Stream.InitIn(module.in_, Read, ReadChars, null);
        module.in_.file[0] = CFiles.in_;
    }
}

WrapOut();
o7.assert(module.out != null);
WrapIn();

return module;
})();

/* Copyright 2019,2021-2022,2024 ComdivByZero
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
(function() { 'use strict';

var nos, platform;

var module = {};
o7.export.Platform = module;

if (typeof require !== 'undefined') {
    nos = require("os");
    if (nos) {
        platform = nos.platform();
        nos = undefined;
    }
} else if (typeof os !== 'undefined') {
    platform = os.platform;
}

module.Linux      = platform == 'linux' || platform == 'android';
module.Bsd        = platform == 'openbsd' || platform == 'freebsd';
module.Dos        = false;
module.Windows    = platform == 'win32';
module.Darwin     = platform == 'darwin';

module.Posix      = module.Linux || module.Bsd || module.Darwin || platform == 'sunos';

module.Wasm       = false;
module.Wasi       = false;

module.C          = false;
module.Java       = false;
module.JavaScript = true;

module.LittleEndian = 1;
module.BigEndian    = 2;
module.ByteOrder    = 1;

return module;
})();

/* Generated by Vostok - Oberon-07 translator */

(function() { 'use strict';

var module = {};
o7.export.Windows = module;

var Cp866 = 866;
module.Cp866 = Cp866;
var Cp1251 = 1251;
module.Cp1251 = Cp1251;
var Utf8 = 65001;
module.Utf8 = Utf8;
/* Неполный список MS-LSID */
var LangNeutral = 0;
module.LangNeutral = LangNeutral;
var Arabic = 1;
module.Arabic = Arabic;
var Bulgarian = 2;
module.Bulgarian = Bulgarian;
var Catalan = 3;
module.Catalan = Catalan;
var Chinese = 4;
module.Chinese = Chinese;
var Czech = 5;
module.Czech = Czech;
var Danish = 6;
module.Danish = Danish;
var Geramn = 7;
module.Geramn = Geramn;
var Greek = 8;
module.Greek = Greek;
var English = 9;
module.English = English;
var Spanish = 10;
module.Spanish = Spanish;
var Finnish = 11;
module.Finnish = Finnish;
var French = 12;
module.French = French;
var Hebrew = 13;
module.Hebrew = Hebrew;
var Hungarian = 14;
module.Hungarian = Hungarian;
var Icelandic = 15;
module.Icelandic = Icelandic;
var Italian = 16;
module.Italian = Italian;
var Japanese = 17;
module.Japanese = Japanese;
var Korean = 18;
module.Korean = Korean;
var Dutch = 19;
module.Dutch = Dutch;
var Norwegian = 20;
module.Norwegian = Norwegian;
var Polish = 21;
module.Polish = Polish;
var Portuguese = 22;
module.Portuguese = Portuguese;
var Romansh = 23;
module.Romansh = Romansh;
var Romanian = 24;
module.Romanian = Romanian;
var Russian = 25;
module.Russian = Russian;
var Croatian = 26;
module.Croatian = Croatian;
var Slovak = 27;
module.Slovak = Slovak;
var Albanian = 28;
module.Albanian = Albanian;
var Swedish = 29;
module.Swedish = Swedish;
var Thai = 30;
module.Thai = Thai;
var Turkish = 31;
module.Turkish = Turkish;
var Urdu = 32;
module.Urdu = Urdu;
var Indonesian = 33;
module.Indonesian = Indonesian;
var Ukrainian = 34;
module.Ukrainian = Ukrainian;
var Belarusian = 35;
module.Belarusian = Belarusian;
var Slovenian = 36;
module.Slovenian = Slovenian;
var Estonian = 37;
module.Estonian = Estonian;
var Latvian = 38;
module.Latvian = Latvian;
var Lithuanian = 39;
module.Lithuanian = Lithuanian;
var Tajik = 40;
module.Tajik = Tajik;
var Farsi = 41;
module.Farsi = Farsi;
var Vietnamese = 42;
module.Vietnamese = Vietnamese;
var Armenian = 43;
module.Armenian = Armenian;
var Azeri = 44;
module.Azeri = Azeri;
var Basque = 45;
module.Basque = Basque;
/* TODO more*/
var Macedonian = 47;
module.Macedonian = Macedonian;
var Afrikaans = 48;
module.Afrikaans = Afrikaans;
var Georgian = 55;
module.Georgian = Georgian;
var Faeroese = 56;
module.Faeroese = Faeroese;
var Hindi = 57;
module.Hindi = Hindi;
var Kazakh = 63;
module.Kazakh = Kazakh;
var Kyrgyz = 64;
module.Kyrgyz = Kyrgyz;
var Uzbek = 67;
module.Uzbek = Uzbek;
var Tatar = 68;
module.Tatar = Tatar;

/* Возвращает MS-LCID */
function GetUserDefaultUILanguage() {
    return LangNeutral;
}
module.GetUserDefaultUILanguage = GetUserDefaultUILanguage;

function SetConsoleCP(code) {
    return false;
}
module.SetConsoleCP = SetConsoleCP;

function SetConsoleOutputCP(code) {
    return false;
}
module.SetConsoleOutputCP = SetConsoleOutputCP;

return module;
})();

/* Generated by Vostok - Oberon-07 translator */

/* Default input and output
 *
 * Copyright (C) 2019,2021-2022 ComdivByZero
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
(function() { 'use strict';
var Stream = o7.import.VDataStream;
var Files = o7.import.VFileStream;
var Platform = o7.import.Platform;
var Windows = o7.import.Windows;

var module = {};
o7.export.VDefaultIO = module;


var in_ = undefined;
var out = undefined;

function OpenIn() {
    var s;
    var ignore;

    if (in_ == null) {
        s = Files.in_;
        ignore = Platform.Windows && Windows.SetConsoleCP(Windows.Utf8);
    } else {
        s = Stream.OpenIn(in_);
    }
    return s;
}
module.OpenIn = OpenIn;

function OpenOut() {
    var s;
    var ignore;

    if (out == null) {
        s = Files.out;
        o7.assert(s != null);
        ignore = Platform.Windows && Windows.SetConsoleOutputCP(Windows.Utf8);
    } else {
        s = Stream.OpenOut(out);
    }
    return s;
}
module.OpenOut = OpenOut;

function SetIn(s) {
    in_ = s;
}
module.SetIn = SetIn;

function SetOut(s) {
    out = s;
}
module.SetOut = SetOut;

in_ = null;
out = null;

return module;
})();

/* Generated by Vostok - Oberon-07 translator */

/* Copyright 2016-2018,2025 ComdivByZero
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *)

(* Oberon-07 types limits / Численные границы стандартных типов Oberon-07 */
(function() { 'use strict';

var module = {};
o7.export.TypesLimits = module;

var IntegerMax = 2147483647;
module.IntegerMax = IntegerMax;
/* минимальное значение в дополнительном коде (-1 - IntegerMax) не входит
	   в основной диапазон для упрощения работы с целыми числами без
	   необходимости учёта особого отрицательного значения, а также для
	   использования в качестве недопустимого значения */
var IntegerMin =  - IntegerMax;
module.IntegerMin = IntegerMin;

var CharMax = 0xFF;
module.CharMax = CharMax;

var ByteMax = 255;
module.ByteMax = ByteMax;

var SetMax = 31;
module.SetMax = SetMax;

var RealScaleMax = 308;
module.RealScaleMax = RealScaleMax;
var RealScaleMin =  - 324;
module.RealScaleMin = RealScaleMin;
var RealExp10Max = 1.0E308;
module.RealExp10Max = RealExp10Max;

function InByteRange(v) {
    return (0 <= v) && (v <= ByteMax);
}
module.InByteRange = InByteRange;

function InCharRange(v) {
    return (0 <= v) && (v <= 0xFF);
}
module.InCharRange = InCharRange;

function InSetRange(v) {
    return (0 <= v) && (v <= SetMax);
}
module.InSetRange = InSetRange;

function InScaleRange(v) {
    return (RealScaleMin <= v) && (v <= RealScaleMax);
}
module.InScaleRange = InScaleRange;

return module;
})();

/* Generated by Vostok - Oberon-07 translator */

/*  Some constants and subroutines for Utf-8/ASC II
 *
 *  Copyright (C) 2016,2020-2023 ComdivByZero
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
(function() { 'use strict';
var TypesLimits = o7.import.TypesLimits;

var module = {};
o7.export.Utf8 = module;

var Null = 0x00;
module.Null = Null;
var TransmissionEnd = 0x04;
module.TransmissionEnd = TransmissionEnd;
var Bell = 0x07;
module.Bell = Bell;
var BackSpace = 0x08;
module.BackSpace = BackSpace;
var Tab = 0x09;
module.Tab = Tab;
var NewLine = 0x0A;
module.NewLine = NewLine;
var NewPage = 0x0C;
module.NewPage = NewPage;
var CarRet = 0x0D;
module.CarRet = CarRet;
var Idle = 0x16;
module.Idle = Idle;
var Escape = 0x1B;
module.Escape = Escape;
var Space = 0x20;
module.Space = Space;
var DQuote = 0x22;
module.DQuote = DQuote;
var Delete = 0x7F;
module.Delete = Delete;


function R() {
    this.val = o7.array(1);
    this.len = NaN;
}
R.prototype.assign = function(r) {
    o7.copy(this.val, r.val);
    this.len = r.len;
}
module.R = R;
module.R = R;

function Up(ch) {
    if (((0xFF & 0x61) <= (0xFF & ch)) && ((0xFF & ch) <= (0xFF & 0x7A))) {
        ch = o7.itc(o7.sub(ch, (0x61 - 0x41)));
    }
    return ch;
}
module.Up = Up;

function Down(ch) {
    if (((0xFF & 0x41) <= (0xFF & ch)) && ((0xFF & ch) <= (0xFF & 0x5A))) {
        ch = o7.itc(o7.add(ch, (0x61 - 0x41)));
    }
    return ch;
}
module.Down = Down;

function EqualIgnoreCase(a, b) {
    var equal;

    if (a == b) {
        equal = true;
    } else if (((0xFF & 0x61) <= (0xFF & a)) && ((0xFF & a) <= (0xFF & 0x7A))) {
        equal = 0x61 - 0x41 == o7.sub(a, b);
    } else if (((0xFF & 0x41) <= (0xFF & a)) && ((0xFF & a) <= (0xFF & 0x5A))) {
        equal = 0x61 - 0x41 == o7.sub(b, a);
    } else {
        equal = false;
    }
    return equal;
}
module.EqualIgnoreCase = EqualIgnoreCase;

function DecodeFirst(first, rest, rest__ai) {
    var v;
    var b;
    var l;

    v = first;
    if (v < 128) {
        l = 1;
        rest.put(rest__ai, v);
    } else if (v >= 192) {
        v = o7.sub(v, 192);
        l = 2;
        b = 32;
        while (v > b) {
            v = o7.sub(v, b);
            l = o7.add(l, 1);
            b = o7.div(b, 2);
        }
        if (v == b) {
            l = o7.add(l, 1);
            v = o7.sub(v, b);
        }
        rest.put(rest__ai, v);
    } else {
        l = 0;
        rest.put(rest__ai,  - 1);
    }
    return l;
}

function Len(first) {
    var rest = o7.array(1);

    return DecodeFirst(first, rest, 0);
}
module.Len = Len;

function Begin(state, first) {
    state.len = o7.sub(DecodeFirst(first, state.val, 0), 1);
    return o7.cmp(state.len, 0) > 0;
}
module.Begin = Begin;

function Next(state, src) {
    var v;

    o7.assert(o7.cmp(state.len, 0) > 0);
    v = src;
    if ((o7.div(v, 64) == 2) && (o7.cmp(state.val[0], o7.div(TypesLimits.IntegerMax, 64)) <= 0)) {
        state.val[0] = o7.add(o7.mul(state.val[0], 64), o7.mod(v, 64));
        state.len = o7.sub(state.len, 1);
    } else {
        state.len = o7.sub(0, state.len);
        state.val[0] = o7.sub(o7.sub(0, 1), state.val[0]);
    }
    return o7.cmp(state.len, 0) > 0;
}
module.Next = Next;

function IsBegin(ch) {
    return o7.div(ch, 64) != 2;
}
module.IsBegin = IsBegin;

function FromCode(utf8, ofs, ofs__ai, val) {
    var ok;
    var i;

    o7.assert((0 <= val) && (val < 1114112));

    i = o7.inited(ofs.at(ofs__ai));
    if (val < 128) {
        ok = i < utf8.length;
        if (ok) {
            utf8.put(i, o7.itc(val));
            ofs.put(ofs__ai, o7.add(i, 1));
        }
    } else if (val < 2048) {
        ok = i < o7.sub(utf8.length, 1);
        if (ok) {
            utf8.put(i, o7.itc(o7.add(192, o7.div(val, 64))));
            utf8.put(o7.add(i, 1), o7.itc(o7.add(128, o7.mod(val, 64))));
            ofs.put(ofs__ai, o7.add(i, 2));
        }
    } else if (val < 65536) {
        ok = i < o7.sub(utf8.length, 2);
        if (ok) {
            utf8.put(i, o7.itc(o7.add(224, o7.div(val, 4096))));
            utf8.put(o7.add(i, 1), o7.itc(o7.add(128, o7.mod(o7.div(val, 64), 64))));
            utf8.put(o7.add(i, 2), o7.itc(o7.add(128, o7.mod(val, 64))));
            ofs.put(ofs__ai, o7.add(i, 3));
        }
    } else {
        ok = i < o7.sub(utf8.length, 3);
        if (ok) {
            utf8.put(i, o7.itc(o7.add(240, o7.div(val, 262144))));
            utf8.put(o7.add(i, 1), o7.itc(o7.add(128, o7.mod(o7.div(val, 4096), 64))));
            utf8.put(o7.add(i, 2), o7.itc(o7.add(128, o7.mod(o7.div(val, 64), 64))));
            utf8.put(o7.add(i, 3), o7.itc(o7.add(128, o7.mod(val, 64))));
            ofs.put(ofs__ai, o7.add(i, 4));
        }
    }
    return ok;
}
module.FromCode = FromCode;

return module;
})();

/* Generated by Vostok - Oberon-07 translator */

(function() { 'use strict';

var module = {};
o7.export.ArrayFill = module;


function Char(a, ofs, ch, n) {
    var i;

    o7.assert(0 <= n);
    o7.assert((0 <= ofs) && (ofs <= o7.sub(a.length, n)));

    n = o7.add(n, o7.sub(ofs, 1));
    for (i = ofs; i <= n; ++i) {
        a.put(i, ch);
    }
}
module.Char = Char;

function Char0(a, ofs, n) {
    Char(a, ofs, 0x00, n);
}
module.Char0 = Char0;

function Byte(a, ofs, b, n) {
    var i;

    o7.assert(0 <= n);
    o7.assert((0 <= ofs) && (ofs <= o7.sub(a.length, n)));

    n = o7.add(n, o7.sub(ofs, 1));
    for (i = ofs; i <= n; ++i) {
        a.put(i, b);
    }
}
module.Byte = Byte;

function Byte0(a, ofs, n) {
    Byte(a, ofs, o7.itb(0), n);
}
module.Byte0 = Byte0;

return module;
})();

/* Generated by Vostok - Oberon-07 translator */

/* Copying arrays of chars and bytes in any direction
 *
 * Copyright 2019,2021 ComdivByZero
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
(function() { 'use strict';

var module = {};
o7.export.ArrayCopy = module;

var FromChars = 0;
module.FromChars = FromChars;
var FromBytes = 1;
module.FromBytes = FromBytes;
var ToChars = 0;
module.ToChars = ToChars;
var ToBytes = 2;
module.ToBytes = ToBytes;

var FromCharsToChars = FromChars + ToChars;
module.FromCharsToChars = FromCharsToChars;
var FromCharsToBytes = FromChars + ToBytes;
module.FromCharsToBytes = FromCharsToBytes;
var FromBytesToChars = FromBytes + ToChars;
module.FromBytesToChars = FromBytesToChars;
var FromBytesToBytes = FromBytes + ToBytes;
module.FromBytesToBytes = FromBytesToBytes;

function Check(destLen, destOfs, srcLen, srcOfs, count) {
    o7.assert(count > 0);
    o7.assert((0 <= destOfs) && (destOfs <= o7.sub(destLen, count)));
    o7.assert((0 <= srcOfs) && (srcOfs <= o7.sub(srcLen, count)));
}

function Chars(dest, destOfs, src, srcOfs, count) {
    var di;
    var si;
    var last;

    Check(dest.length, destOfs, src.length, srcOfs, count);

    last = o7.sub(o7.add(destOfs, count), 1);
    if (destOfs == srcOfs) {
        for (di = destOfs; di <= last; ++di) {
            dest.put(di, o7.inited(src.at(di)));
        }
    } else {
        si = srcOfs;
        for (di = destOfs; di <= last; ++di) {
            dest.put(di, o7.inited(src.at(si)));
            si = o7.add(si, 1);
        }
    }
}
module.Chars = Chars;

function Bytes(dest, destOfs, src, srcOfs, count) {
    var di;
    var si;
    var last;

    Check(dest.length, destOfs, src.length, srcOfs, count);

    last = o7.sub(o7.add(destOfs, count), 1);
    if (destOfs == srcOfs) {
        for (di = destOfs; di <= last; ++di) {
            dest.put(di, o7.inited(src.at(di)));
        }
    } else {
        si = srcOfs;
        for (di = destOfs; di <= last; ++di) {
            dest.put(di, o7.inited(src.at(si)));
            si = o7.add(si, 1);
        }
    }
}
module.Bytes = Bytes;

function CharsToBytes(dest, destOfs, src, srcOfs, count) {
    var di;
    var si;
    var last;

    Check(dest.length, destOfs, src.length, srcOfs, count);

    last = o7.sub(o7.add(destOfs, count), 1);
    if (destOfs == srcOfs) {
        for (di = destOfs; di <= last; ++di) {
            dest.put(di, o7.itb(src.at(di)));
        }
    } else {
        si = srcOfs;
        for (di = destOfs; di <= last; ++di) {
            dest.put(di, o7.itb(src.at(si)));
            si = o7.add(si, 1);
        }
    }
}
module.CharsToBytes = CharsToBytes;

function BytesToChars(dest, destOfs, src, srcOfs, count) {
    var di;
    var si;
    var last;

    Check(dest.length, destOfs, src.length, srcOfs, count);

    last = o7.sub(o7.add(destOfs, count), 1);
    if (destOfs == srcOfs) {
        for (di = destOfs; di <= last; ++di) {
            dest.put(di, o7.itc(src.at(di)));
        }
    } else {
        si = srcOfs;
        for (di = destOfs; di <= last; ++di) {
            dest.put(di, o7.itc(src.at(si)));
            si = o7.add(si, 1);
        }
    }
}
module.BytesToChars = BytesToChars;

function Data(direction, destBytes, destChars, destOfs, srcBytes, srcChars, srcOfs, count) {
    switch (direction) {
    case 0:
        Chars(destChars, destOfs, srcChars, srcOfs, count);
        break;
    case 2:
        CharsToBytes(destBytes, destOfs, srcChars, srcOfs, count);
        break;
    case 1:
        BytesToChars(destChars, destOfs, srcBytes, srcOfs, count);
        break;
    case 3:
        Bytes(destBytes, destOfs, srcBytes, srcOfs, count);
        break;
    default:
        o7.caseFail(direction);
        break;
    }
}
module.Data = Data;

return module;
})();

/* Generated by Vostok - Oberon-07 translator */

/* Operations with arrays of chars, which represent 0-terminated strings
 * Copyright 2018-2019,2021-2023 ComdivByZero
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *)

(* Модуль для работы с цепочками литер, имитирующих строки.
 * Конец строки определяется по положению 0-го символа с
 * наименьшим индексом
 */
(function() { 'use strict';
var Utf8 = o7.import.Utf8;
var ArrayFill = o7.import.ArrayFill;
var ArrayCopy = o7.import.ArrayCopy;

var module = {};
o7.export.Charz = module;


function CalcLen(str, ofs) {
    var i;

    i = ofs;
    while ((0xFF & str.at(i)) != (0xFF & 0x00)) {
        i = o7.add(i, 1);
    }
    return o7.sub(i, ofs);
}
module.CalcLen = CalcLen;

function Fill(ch, count, dest, ofs, ofs__ai) {
    var ok;
    var i;
    var end;

    o7.assert((0xFF & ch) != (0xFF & 0x00));
    o7.assert((o7.cmp(0, ofs.at(ofs__ai)) <= 0) && (o7.cmp(ofs.at(ofs__ai), dest.length) < 0));

    ok = count < o7.sub(dest.length, ofs.at(ofs__ai));
    i = o7.inited(ofs.at(ofs__ai));
    if (ok) {
        end = o7.add(i, count);
        while (i < end) {
            dest.put(i, ch);
            i = o7.add(i, 1);
        }
        ofs.put(ofs__ai, i);
    }
    dest.put(i, 0x00);
    return ok;
}
module.Fill = Fill;

function CopyAtMost(dest, destOfs, destOfs__ai, src, srcOfs, srcOfs__ai, atMost) {
    var ok;
    var s;
    var d;
    var lim;

    s = o7.inited(srcOfs.at(srcOfs__ai));
    d = o7.inited(destOfs.at(destOfs__ai));
    o7.assert((0 <= s) && (s <= src.length));
    o7.assert((0 <= d) && (d <= dest.length));
    o7.assert(0 <= atMost);

    lim = o7.add(d, atMost);
    if (o7.sub(dest.length, 1) < lim) {
        lim = o7.sub(dest.length, 1);
    }

    while ((d < lim) && ((0xFF & src.at(s)) != (0xFF & 0x00))) {
        dest.put(d, o7.inited(src.at(s)));
        d = o7.add(d, 1);
        s = o7.add(s, 1);
    }

    ok = (d == o7.add(destOfs.at(destOfs__ai), atMost)) || (src.at(s) == 0x00);

    dest.put(d, 0x00);
    srcOfs.put(srcOfs__ai, s);
    destOfs.put(destOfs__ai, d);

    o7.assert((o7.cmp(destOfs.at(destOfs__ai), dest.length) == 0) || (dest.at(destOfs.at(destOfs__ai)) == 0x00));
    return ok;
}
module.CopyAtMost = CopyAtMost;

function Copy(dest, destOfs, destOfs__ai, src, srcOfs, srcOfs__ai) {
    var s;
    var d;

    s = o7.inited(srcOfs.at(srcOfs__ai));
    d = o7.inited(destOfs.at(destOfs__ai));
    o7.assert((0 <= s) && (s <= src.length));
    o7.assert((0 <= d) && (d <= dest.length));

    while ((d < o7.sub(dest.length, 1)) && ((0xFF & src.at(s)) != (0xFF & 0x00))) {
        dest.put(d, o7.inited(src.at(s)));
        d = o7.add(d, 1);
        s = o7.add(s, 1);
    }

    dest.put(d, 0x00);
    srcOfs.put(srcOfs__ai, s);
    destOfs.put(destOfs__ai, d);

    o7.assert(dest.at(destOfs.at(destOfs__ai)) == 0x00);
    return src.at(s) == 0x00;
}
module.Copy = Copy;

function FindNull(s, ofs, end) {
    while ((ofs < end) && ((0xFF & s.at(ofs)) != (0xFF & 0x00))) {
        ofs = o7.add(ofs, 1);
    }
    return ofs;
}

function CopyChars(dest, destOfs, destOfs__ai, src, srcOfs, srcEnd) {
    var s;
    var d;
    var len;
    var ok;

    s = srcOfs;
    d = o7.inited(destOfs.at(destOfs__ai));
    o7.assert((0 <= s) && (s <= src.length));
    o7.assert((0 <= d) && (d <= dest.length));
    o7.assert(s <= srcEnd);
    o7.assert(FindNull(src, s, srcEnd) == srcEnd);

    len = o7.sub(srcEnd, s);
    ok = d < o7.sub(dest.length, len);
    if (!ok) {
        len = dest.length;
        srcEnd = o7.sub(o7.add(s, len), 1);
    }
    if (len > 0) {
        ArrayCopy.Chars(dest, d, src, s, o7.sub(srcEnd, s));
    }
    d = o7.add(d, len);
    dest.put(d, 0x00);
    destOfs.put(destOfs__ai, d);
    return ok;
}
module.CopyChars = CopyChars;

function CopyCharsFromLoop(dest, destOfs, destOfs__ai, src, srcOfs, srcEnd) {
    var ok;

    if (srcOfs <= srcEnd) {
        ok = CopyChars(dest, destOfs, destOfs__ai, src, srcOfs, srcEnd);
    } else {
        ok = CopyChars(dest, destOfs, destOfs__ai, src, srcOfs, src.length) && CopyChars(dest, destOfs, destOfs__ai, src, 0, srcEnd);
    }
    return ok;
}
module.CopyCharsFromLoop = CopyCharsFromLoop;

function CopyCharsUntil(dest, destOfs, destOfs__ai, src, srcOfs, srcOfs__ai, until) {
    var s;
    var d;

    s = o7.inited(srcOfs.at(srcOfs__ai));
    d = o7.inited(destOfs.at(destOfs__ai));
    o7.assert((0 <= s) && (s < src.length));
    o7.assert((0 <= d) && (d <= dest.length));

    while (((0xFF & src.at(s)) != (0xFF & until)) && (d < o7.sub(dest.length, 1))) {
        o7.assert((0xFF & src.at(s)) != (0xFF & 0x00));
        dest.put(d, o7.inited(src.at(s)));
        d = o7.add(d, 1);
        s = o7.add(s, 1);
    }
    dest.put(d, 0x00);
    destOfs.put(destOfs__ai, d);
    srcOfs.put(srcOfs__ai, s);
    return src.at(s) == until;
}
module.CopyCharsUntil = CopyCharsUntil;

function CopyString(dest, ofs, ofs__ai, src) {
    var i = o7.array(1);

    i[0] = 0;
    return Copy(dest, ofs, ofs__ai, src, i, 0);
}
module.CopyString = CopyString;

function Set(dest, src) {
    var i = o7.array(1);
    var j = o7.array(1);

    i[0] = 0;
    j[0] = 0;
    return Copy(dest, i, 0, src, j, 0);
}
module.Set = Set;

function CopyChar(dest, ofs, ofs__ai, ch, n) {
    var ok;
    var i;

    i = o7.inited(ofs.at(ofs__ai));
    o7.assert(0 <= n);
    o7.assert((0xFF & ch) != (0xFF & 0x00));
    o7.assert((0 <= i) && (i < dest.length));
    ok = i < o7.sub(dest.length, n);
    if (ok) {
        ArrayFill.Char(dest, i, ch, n);
        i = o7.add(i, n);
    }
    dest.put(i, 0x00);
    ofs.put(ofs__ai, i);
    return ok;
}
module.CopyChar = CopyChar;

function PutChar(dest, ofs, ofs__ai, ch) {
    return CopyChar(dest, ofs, ofs__ai, ch, 1);
}
module.PutChar = PutChar;

function SearchChar(str, pos, pos__ai, c) {
    var i;

    i = o7.inited(pos.at(pos__ai));
    o7.assert((0 <= i) && (i < str.length));

    while (((0xFF & str.at(i)) != (0xFF & c)) && ((0xFF & str.at(i)) != (0xFF & 0x00))) {
        i = o7.add(i, 1);
    }
    pos.put(pos__ai, i);
    return str.at(i) == c;
}
module.SearchChar = SearchChar;

function SearchCharLast(str, pos, pos__ai, c) {
    var i;
    var j;

    i = o7.inited(pos.at(pos__ai));
    o7.assert((0 <= i) && (i < str.length));

    j =  - 1;
    while ((0xFF & str.at(i)) != (0xFF & 0x00)) {
        if (str.at(i) == c) {
            j = i;
        }
        i = o7.add(i, 1);
    }
    pos.put(pos__ai, j);
    return 0 <= j;
}
module.SearchCharLast = SearchCharLast;

function Compare(s1, ofs1, s2, ofs2) {
    while ((s1.at(ofs1) == s2.at(ofs2)) && ((0xFF & s1.at(ofs1)) != (0xFF & 0x00))) {
        ofs1 = o7.add(ofs1, 1);
        ofs2 = o7.add(ofs2, 1);
    }
    return o7.sub(s1.at(ofs1), s2.at(ofs2));
}
module.Compare = Compare;

function Trim(str, ofs) {
    var i;
    var j;

    i = ofs;
    while ((str.at(i) == 0x20) || (str.at(i) == 0x09)) {
        i = o7.add(i, 1);
    }
    if (ofs < i) {
        j = ofs;
        while ((0xFF & str.at(i)) != (0xFF & 0x00)) {
            str.put(j, o7.inited(str.at(i)));
            j = o7.add(j, 1);
            i = o7.add(i, 1);
        }
    } else {
        j = o7.add(ofs, CalcLen(str, ofs));
    }
    while ((ofs < j) && ((str.at(o7.sub(j, 1)) == 0x20) || (str.at(o7.sub(j, 1)) == 0x09))) {
        j = o7.sub(j, 1);
    }
    str.put(j, 0x00);
    return o7.sub(j, ofs);
}
module.Trim = Trim;

return module;
})();

/* Generated by Vostok - Oberon-07 translator */

/* Converter of hexadecimal digit in CHAR to INTEGER and vise versa
 *
 * Copyright 2019,2021,2025 ComdivByZero
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
(function() { 'use strict';

var module = {};
o7.export.HexDigit = module;

var Range = o7.set(0, 15);
module.Range = Range;

function From(d) {
    o7.assert(o7.in(d, Range));
    if (d < 10) {
        d = o7.add(d, 0x30);
    } else {
        d = o7.add(d, 0x41 - 10);
    }
    return o7.itc(d);
}
module.From = From;

function Is(ch) {
    return ((0xFF & 0x30) <= (0xFF & ch)) && ((0xFF & ch) <= (0xFF & 0x39)) || ((0xFF & 0x41) <= (0xFF & ch)) && ((0xFF & ch) <= (0xFF & 0x46));
}
module.Is = Is;

function WithLowCaseIs(ch) {
    return ((0xFF & 0x30) <= (0xFF & ch)) && ((0xFF & ch) <= (0xFF & 0x39)) || ((0xFF & 0x41) <= (0xFF & ch)) && ((0xFF & ch) <= (0xFF & 0x46)) || ((0xFF & 0x61) <= (0xFF & ch)) && ((0xFF & ch) <= (0xFF & 0x66));
}
module.WithLowCaseIs = WithLowCaseIs;

function ToInt(d) {
    var i;

    o7.assert(Is(d));

    if ((0xFF & d) <= (0xFF & 0x39)) {
        i = o7.sub(d, 0x30);
    } else {
        i = o7.sub(d, (0x41 - 10));
    }
    return i;
}
module.ToInt = ToInt;

function WithLowCaseToInt(d) {
    var i;

    o7.assert(WithLowCaseIs(d));

    if ((0xFF & d) <= (0xFF & 0x39)) {
        i = o7.sub(d, 0x30);
    } else if ((0xFF & d) <= (0xFF & 0x46)) {
        i = o7.sub(d, (0x41 - 10));
    } else {
        i = o7.sub(d, (0x61 - 10));
    }
    return i;
}
module.WithLowCaseToInt = WithLowCaseToInt;

return module;
})();

/* Generated by Vostok - Oberon-07 translator */

(function() { 'use strict';
var HexDigit = o7.import.HexDigit;
var ArrayFill = o7.import.ArrayFill;

var module = {};
o7.export.IntToCharz = module;

var DCount__T = 1000;
var HCount__T = 65536;

function DCount(v, v__ai, neg, neg__ai) {
    var c;
    var i;

    i = o7.inited(v.at(v__ai));
    c = o7.bti(i < 0);
    neg.put(neg__ai, c == 1);
    if (c == 1) {
        i = o7.sub(0, i);
        v.put(v__ai, i);
    }
    if (i < o7.mul(10, DCount__T)) {
        if (i < 100) {
            c = o7.add(c, o7.sub(2, o7.bti(i < 10)));
        } else {
            c = o7.add(c, o7.sub(4, o7.bti(i < DCount__T)));
        }
    } else if (i < o7.mul(DCount__T, DCount__T)) {
        c = o7.add(c, o7.sub(6, o7.bti(i < o7.mul(100, DCount__T))));
    } else if (i < o7.mul(o7.mul(100, DCount__T), DCount__T)) {
        c = o7.add(c, o7.sub(8, o7.bti(i < o7.mul(o7.mul(10, DCount__T), DCount__T))));
    } else {
        c = o7.add(c, o7.sub(10, o7.bti(i < o7.mul(o7.mul(DCount__T, DCount__T), DCount__T))));
    }
    return c;
}

function HCount(v, v__ai, neg, neg__ai) {
    var c;
    var i;

    i = o7.inited(v.at(v__ai));
    c = o7.bti(i < 0);
    neg.put(neg__ai, c == 1);
    if (c == 1) {
        i = o7.sub(0, i);
        v.put(v__ai, i);
    }
    if (i < 65536) {
        if (i < 256) {
            c = o7.add(c, o7.sub(2, o7.bti(i < 16)));
        } else {
            c = o7.add(c, o7.sub(4, o7.bti(i < 4096)));
        }
    } else if (i < o7.mul(256, HCount__T)) {
        c = o7.add(c, o7.sub(6, o7.bti(i < o7.mul(16, HCount__T))));
    } else {
        c = o7.add(c, o7.sub(8, o7.bti(i < o7.mul(4096, HCount__T))));
    }
    return c;
}

function DecCount(i) {
    var neg = o7.array(1);
    var i__prm = o7.array(1);

    i__prm[0] = i;
    return DCount(i__prm, 0, neg, 0);
}
module.DecCount = DecCount;

function HexCount(i) {
    var neg = o7.array(1);
    var i__prm = o7.array(1);

    i__prm[0] = i;
    return HCount(i__prm, 0, neg, 0);
}
module.HexCount = HexCount;

function Dec(str, ofs, ofs__ai, value_, n) {
    var s;
    var i;
    var c;
    var ok;
    var neg = o7.array(1);
    var value__prm = o7.array(1);

    value__prm[0] = value_;
    o7.assert((o7.cmp(0, ofs.at(ofs__ai)) <= 0) && (o7.cmp(ofs.at(ofs__ai), str.length) < 0));
    s = o7.inited(ofs.at(ofs__ai));

    c = DCount(value__prm, 0, neg, 0);
    if (c < n) {
        c = n;
    }
    ok = s < o7.sub(str.length, c);
    if (ok) {
        i = o7.add(s, c);
        ofs.put(ofs__ai, i);
        str.put(i, 0x00);

        do {
            i = o7.sub(i, 1);
            str.put(i, o7.itc(o7.add(0x30, o7.mod(value__prm[0], 10))));
            value__prm[0] = o7.div(value__prm[0], 10);
        } while (!(o7.cmp(value__prm[0], 0) == 0));

        if (o7.inited(neg[0])) {
            i = o7.sub(i, 1);
            str.put(i, 0x2D);
        }

        ArrayFill.Char(str, s, 0x20, o7.sub(i, s));
    }
    return ok;
}
module.Dec = Dec;

function Hex(str, ofs, ofs__ai, value_, n) {
    var s;
    var i;
    var c;
    var ok;
    var neg = o7.array(1);
    var value__prm = o7.array(1);

    value__prm[0] = value_;
    o7.assert((o7.cmp(0, ofs.at(ofs__ai)) <= 0) && (o7.cmp(ofs.at(ofs__ai), str.length) < 0));
    s = o7.inited(ofs.at(ofs__ai));

    c = HCount(value__prm, 0, neg, 0);
    if (c < n) {
        c = n;
    }
    ok = s < o7.sub(str.length, c);
    if (ok) {
        i = o7.add(s, c);
        ofs.put(ofs__ai, i);
        str.put(i, 0x00);

        do {
            i = o7.sub(i, 1);
            str.put(i, HexDigit.From(o7.mod(value__prm[0], 16)));
            value__prm[0] = o7.div(value__prm[0], 16);
        } while (!(o7.cmp(value__prm[0], 0) == 0));

        if (o7.inited(neg[0])) {
            i = o7.sub(i, 1);
            str.put(i, 0x2D);
        }

        ArrayFill.Char(str, s, 0x20, o7.sub(i, s));
    }
    return ok;
}
module.Hex = Hex;

return module;
})();

/* Generated by Vostok - Oberon-07 translator */

(function() { 'use strict';

var module = {};
o7.export.MathPowerInt10 = module;


var val = o7.array(10);
module.val = val;

module.val[0] = 1;
module.val[1] = 10;
module.val[2] = 100;
module.val[3] = 1000;
module.val[4] = 10000;
module.val[5] = 100000;
module.val[6] = 1000000;
module.val[7] = 10000000;
module.val[8] = 100000000;
module.val[9] = 1000000000;

return module;
})();

/* Generated by Vostok - Oberon-07 translator */

(function() { 'use strict';
var MathPowerInt10 = o7.import.MathPowerInt10;

var module = {};
o7.export.MathPower10 = module;


var p8 = o7.array(7);
var p64 = o7.array(4);

function Nat(n) {
    var p;

    p = o7.flt(MathPowerInt10.val.at(o7.mod(n, 8)));
    n = o7.div(n, 8);
    if (n > 0) {
        if (o7.mod(n, 8) > 0) {
            p = o7.fmul(p, p8.at(o7.sub(o7.mod(n, 8), 1)));
        }
        n = o7.div(n, 8);
        if (n > 0) {
            p = o7.fmul(p, p64.at(o7.sub(n, 1)));
        }
    }
    return p;
}

/* -308 ≤ n ≤ 308 */
function Calc(n) {
    var p;

    o7.assert(( - 308 <= n) && (n <= 308));

    if (n >= 0) {
        p = Nat(n);
    } else {
        p = o7.fdiv(1.0, Nat(o7.sub(0, n)));
    }
    return p;
}
module.Calc = Calc;

p8[0] = 1.0E+8;
p8[1] = 1.0E+16;
p8[2] = 1.0E+24;
p8[3] = 1.0E+32;
p8[4] = 1.0E+40;
p8[5] = 1.0E+48;
p8[6] = 1.0E+56;

p64[0] = 1.0E+64;
p64[1] = 1.0E+128;
p64[2] = 1.0E+192;
p64[3] = 1.0E+256;

return module;
})();

/* Generated by Vostok - Oberon-07 translator */

(function() { 'use strict';

var module = {};
o7.export.Real64 = module;


function T() {
    this.v = NaN;
}
T.prototype.assign = function(r) {
    this.v = r.v;
}
module.T = T;
module.T = T;

function IsNan(r) {
    return r.v != r.v;
}
module.IsNan = IsNan;

function IsFinite(r) {
    return r.v == r.v;
}
module.IsFinite = IsFinite;

function From(r, s) {
    r.v = s;
}
module.From = From;

function To(r, r__ai, s) {
    var ok;

    ok = IsFinite(s);
    if (ok) {
        r.put(r__ai, o7.inited(s.v));
    }
    return ok;
}
module.To = To;

function Neg(r, a) {
    r.v = o7.fsub(0, a.v);
}
module.Neg = Neg;

function Add(r, a, b) {
    r.v = o7.fadd(a.v, b.v);
}
module.Add = Add;

function Sub(r, a, b) {
    r.v = o7.fsub(a.v, b.v);
}
module.Sub = Sub;

function Mul(r, a, b) {
    r.v = o7.fmul(a.v, b.v);
}
module.Mul = Mul;

function Div(r, a, b) {
    r.v = o7.fdiv(a.v, b.v);
}
module.Div = Div;

function Pack(r, n) {
    r.v = o7.scalb(r.v, n);
}
module.Pack = Pack;

function Unpk(r, n, n__ai) {
    r.v = o7.frexp(r.v, n, n__ai);
}
module.Unpk = Unpk;

function Cmp(a, b) {
    var c;

    if (a.v < b.v) {
        c =  - 1;
    } else if (a.v > b.v) {
        c =  + 1;
    } else {
        c = 0;
    }
    return c;
}
module.Cmp = Cmp;

function CmpReal(a, b) {
    var c;

    if (a.v < b) {
        c =  - 1;
    } else if (a.v > b) {
        c =  + 1;
    } else {
        c = 0;
    }
    return c;
}
module.CmpReal = CmpReal;

return module;
})();

/* Generated by Vostok - Oberon-07 translator */

(function() { 'use strict';
var Real64 = o7.import.Real64;
var TypesLimits = o7.import.TypesLimits;
var MathPower10 = o7.import.MathPower10;

var module = {};
o7.export.Real64Pack10 = module;


function Do(x, e) {
    var m = new Real64.T ();

    o7.assert(Math.abs(e) <= TypesLimits.RealScaleMax - TypesLimits.RealScaleMin);

    Real64.From(m, 1.0E308);

    if (Real64.CmpReal(x, 0.0) == 0) {
    } else if (e > 0) {
        while (e >= 308) {
            e = o7.sub(e, 308);
            Real64.Mul(x, x, m);
        }
        Real64.From(m, MathPower10.Calc(e));
        Real64.Mul(x, x, m);
    } else if (e < 0) {
        while (e <=  - 308) {
            e = o7.add(e, 308);
            Real64.Div(x, x, m);
        }
        Real64.From(m, MathPower10.Calc(o7.sub(0, e)));
        Real64.Div(x, x, m);
    }
}
module.Do = Do;

return module;
})();

/* Generated by Vostok - Oberon-07 translator */

(function() { 'use strict';
var MathPower10 = o7.import.MathPower10;
var Real64 = o7.import.Real64;
var Real64Pack10 = o7.import.Real64Pack10;
var Limits = o7.import.TypesLimits;

var module = {};
o7.export.Real10 = module;


/* x' := x / 10**e'; e' := round(lg(x)); 1.0 ≤ x' < 10.0 */
function Unpk(x, x__ai, e, e__ai) {
    var e10;
    var e2 = o7.array(1);
    var de;
    var tx;
    var xx;
    var tens;
    var pos;

    tx = o7.inited(x.at(x__ai));
    pos = tx >= 0.0;
    tx = Math.abs(tx);
    xx = tx;

    tx = o7.frexp(tx, e2, 0);
    e10 = o7.div(o7.mul(Math.abs(e2[0]), 1233), 4096);
    /*  *lg10(2) */
    de = o7.sub(e10, 308);
    if (de > 0) {
        e10 = 308;
    }
    tens = MathPower10.Calc(e10);
    if (o7.cmp(e2[0], 0) < 0) {
        xx = o7.fmul(xx, tens);
        if (de > 0) {
            xx = o7.fmul(xx, MathPower10.Calc(de));
            e10 = o7.add(e10, de);
        }
        while (xx < 1.0) {
            e10 = o7.add(e10, 1);
            xx = o7.fmul(xx, 10.0);
        }
        e10 = o7.sub(0, e10);
    } else {
        if (10.0 <= xx) {
            xx = o7.fdiv(xx, tens);
            while (10.0 <= xx) {
                e10 = o7.add(e10, 1);
                xx = o7.fdiv(xx, 10.0);
            }
        } else {
            e10 = 0;
        }
    }
    o7.assert((1.0 <= xx) && (xx < 10.0));

    e.put(e__ai, e10);
    if (pos) {
        x.put(x__ai, xx);
    } else {
        x.put(x__ai, o7.fsub(0, xx));
    }
}
module.Unpk = Unpk;

/* x' := x * 10**e; ABS(e) ≤ TypesLimits.RealScaleMax - TypesLimits.RealScaleMin */
function Pack(x, x__ai, e) {
    var x64 = new Real64.T ();
    var overflow;

    Real64.From(x64, x.at(x__ai));
    Real64Pack10.Do(x64, e);
    overflow = !Real64.To(x, x__ai, x64);
    o7.assert(!overflow);
}
module.Pack = Pack;

return module;
})();

/* Generated by Vostok - Oberon-07 translator */

(function() { 'use strict';
var ArrayFill = o7.import.ArrayFill;
var ArrayCopy = o7.import.ArrayCopy;
var Real10 = o7.import.Real10;
var Int10 = o7.import.MathPowerInt10;

var module = {};
o7.export.RealToCharz = module;


function Digit(i) {
    o7.assert((0 <= i) && (i < 10));
    return o7.itc(o7.add(0x30, i));
}

function Exp(str, ofs, ofs__ai, x, n) {
    var s = o7.array(32);
    var i = o7.array(1);
    var e;
    var se = o7.array(1);
    var dE = o7.array(1);
    var eLen;
    var lim;
    var sign;
    var ok;
    var x__prm = o7.array(1);

    function Exponent(s, i, i__ai, len, sign, e) {
        var l;

        if (len > 0) {
            l = o7.add(i.at(i__ai), len);
            i.put(i__ai, l);

            do {
                s.put(l, Digit(o7.mod(e, 10)));
                e = o7.div(e, 10);
                l = o7.sub(l, 1);
            } while (!(e == 0));
            if (sign < 0) {
                s.put(l, 0x2D);
                l = o7.sub(l, 1);
            }
            s.put(l, 0x45);
        }
    }

    function Significand(s, i, i__ai, x, l, dE, dE__ai) {
        var d;
        var d1;
        var n;
        var p10;
        var xp;

        function Inc(s, i, i__ai, dE, dE__ai) {
            var j;

            j = o7.inited(i.at(i__ai));
            while (s.at(j) == 0x39) {
                j = o7.sub(j, 1);
            }
            j = o7.sub(j, o7.bti(s.at(j) == 0x2E));
            if ((0xFF & s.at(j)) != (0xFF & 0x39)) {
                s.put(j, o7.itc(o7.add(s.at(j), 1)));
            } else {
                s.put(j, 0x31);
                j = o7.add(j, 2);
                s.put(j, 0x30);
                dE.put(dE__ai, 1);
            }
            i.put(i__ai, j);
        }

        function Digits(s, i, n, d) {
            var k;

            o7.assert(d >= 0);
            for (k = o7.sub(n, 1); k >= 0; --k) {
                o7.assert(d >= 0);
                s.put(o7.add(i, k), Digit(o7.mod(d, 10)));
                d = o7.div(d, 10);
            }
            o7.assert(d == 0);
        }

        i.inc(i__ai, 1);
        n = o7.sub(l, i.at(i__ai));
        if (n > 9) {
            n = 9;
        }
        o7.assert(x >= 0.0);
        xp = o7.fmul(x, o7.flt(Int10.val.at(o7.sub(n, 1))));
        d = o7.floor(xp);
        Digits(s, i.at(i__ai), n, d);
        s.put(o7.sub(i.at(i__ai), 1), o7.inited(s.at(i.at(i__ai))));
        s.put(i.at(i__ai), 0x2E);
        i.inc(i__ai, n);
        if (o7.cmp(i.at(i__ai), l) < 0) {
            p10 = o7.flt(Int10.val.at(o7.sub(l, i.at(i__ai))));
            xp = o7.fsub(o7.fmul(x, (o7.fmul(1.E8, p10))), o7.fmul(o7.flt(d), p10));
            if (xp >= 0.0) {
                d1 = o7.floor(xp);
            } else {
                /* из-за погрешности */
                d1 = 0;
            }
            Digits(s, i.at(i__ai), o7.sub(l, i.at(i__ai)), d1);

            x = o7.fsub(o7.fsub(o7.fmul(x, (o7.fmul(1.E9, p10))), o7.fmul(o7.flt(d), o7.flt(Int10.val.at(o7.add(o7.sub(l, i.at(i__ai)), 1))))), o7.flt(o7.mul(d1, 10)));
            i.put(i__ai, o7.sub(l, 1));
        } else {
            x = o7.fsub(o7.fmul(x, o7.flt(Int10.val.at(n))), o7.fmul(o7.flt(d), 10.0));
        }

        dE.put(dE__ai, 0);
        if (5.0 <= x) {
            Inc(s, i, i__ai, dE, dE__ai);
        } else {
            while (s.at(i.at(i__ai)) == 0x30) {
                i.inc(i__ai, -1);
            }
        }
    }

    x__prm[0] = x;
    o7.assert(n >= 0);
    o7.assert((o7.cmp(0, ofs.at(ofs__ai)) <= 0) && (o7.cmp(ofs.at(ofs__ai), str.length) < 0));

    sign = x__prm[0] < 0.0;
    i[0] = o7.bti(sign);
    if (sign) {
        s[0] = 0x2D;
        x__prm[0] = o7.fsub(0, x__prm[0]);
    }
    if (x__prm[0] != x__prm[0]) {
        ArrayCopy.Chars(s, i[0], [78,97,78,0], 0, 3);
        i.inc(0, 2);
    } else if (x__prm[0] == 0.0) {
        ArrayCopy.Chars(s, i[0], [48,46,48,0], 0, 3);
        i.inc(0, 2);
    } else {
        Real10.Unpk(x__prm, 0, se, 0);
        e = Math.abs(se[0]);
        if (e == 0) {
            eLen = 0;
        } else {
            if (e < 10) {
                eLen = 2;
            } else if (e < 100) {
                eLen = 3;
            } else {
                eLen = 4;
            }
            eLen = o7.add(eLen, o7.bti(o7.cmp(se[0], 0) < 0));
        }
        if (n == 0) {
            lim = 17;
        } else {
            lim = o7.sub(n, eLen);
            if (lim < 3) {
                lim = 3;
            }
        }
        Significand(s, i, 0, x__prm[0], lim, dE, 0);
        if ((0xFF & s.at(i[0])) != (0xFF & 0x2E)) {
        } else if (e != 0) {
            i.inc(0, -1);
        } else {
            i.inc(0, 1);
        }
        if (o7.cmp(se[0], 0) > 0) {
            Exponent(s, i, 0, eLen, 1, o7.add(e, dE[0]));
        } else {
            Exponent(s, i, 0, eLen,  - 1, o7.sub(e, dE[0]));
        }
    }
    i.inc(0, 1);
    if (o7.cmp(n, i[0]) > 0) {
        n = o7.sub(n, i[0]);
    } else {
        n = 0;
    }

    ok = o7.add(n, i[0]) < o7.sub(str.length, ofs.at(ofs__ai));
    if (ok) {
        ArrayFill.Char(str, ofs.at(ofs__ai), 0x20, n);
        ArrayCopy.Chars(str, o7.add(ofs.at(ofs__ai), n), s, 0, i[0]);
        ofs.inc(ofs__ai, o7.add(i[0], n));
        str.put(ofs.at(ofs__ai), 0x00);
    }
    return ok;
}
module.Exp = Exp;

return module;
})();

/* Generated by Vostok - Oberon-07 translator */

/* Simple module for formatted output based on Oakwood guidelines
 *
 * Copyright 2017-2019,2021,2023 ComdivByZero
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
(function() { 'use strict';
var Stream = o7.import.VDataStream;
var IO = o7.import.VDefaultIO;
var Charz = o7.import.Charz;
var Platform = o7.import.Platform;
var IntToCharz = o7.import.IntToCharz;
var RealToCharz = o7.import.RealToCharz;

var module = {};
o7.export.Out = module;


var success;
var ln = o7.array(2);
var lnOfs = NaN;
var out = o7.array(1);

function Write(s, ofs, len) {
    success = len == Stream.WriteChars(out[0], s, ofs, len);
}

function String(s) {
    Write(s, 0, Charz.CalcLen(s, 0));
}
module.String = String;

function Char(ch) {
    var s = o7.array(1);

    s[0] = ch;
    Write(s, 0, 1);
}
module.Char = Char;

function Int(x, n) {
    var s = o7.array(64);
    var i = o7.array(1);

    i[0] = 0;
    o7.assert(IntToCharz.Dec(s, i, 0, x, n));
    Write(s, 0, i[0]);
}
module.Int = Int;

function Ln() {
    Write(ln, lnOfs, o7.sub(2, lnOfs));
}
module.Ln = Ln;

function Real(x, n) {
    var s = o7.array(64);
    var i = o7.array(1);

    i[0] = 0;
    o7.assert(RealToCharz.Exp(s, i, 0, x, n));
    Write(s, 0, i[0]);
}
module.Real = Real;

function LongReal(x, n) {
    Real(x, n);
}
module.LongReal = LongReal;

function Open() {
    var o;

    o = IO.OpenOut();
    success = o != null;
    if (success) {
        Stream.CloseOut(out, 0);
        out[0] = o;
    }
}
module.Open = Open;

ln[0] = 0x0D;
ln[1] = 0x0A;
lnOfs = o7.bti(Platform.Posix);
out[0] = IO.OpenOut();

return module;
})();

/* Generated by Vostok - Oberon-07 translator */

(function() { 'use strict';
var Out = o7.import.Out;
var HexDigit = o7.import.HexDigit;

var module = {};
o7.export.log = module;


function s(str) {
    Out.String(str);
}
module.s = s;

function sn(str) {
    Out.String(str);
    Out.Ln();
}
module.sn = sn;

function c(ch) {
    var str = o7.array(2);

    str[0] = ch;
    str[1] = 0x00;
    Out.String(str);
}
module.c = c;

function i(int_) {
    Out.Int(int_, 0);
}
module.i = i;

function in_(int_) {
    Out.Int(int_, 0);
    Out.Ln();
}
module.in_ = in_;

function h(int_) {
    var buf = o7.array(9);
    var j;
    var k;

    j = 9 - 2;
    buf.put(j, HexDigit.From(o7.mod(int_, 16)));
    int_ = o7.add(o7.div(int_, 16), o7.mul(o7.bti(int_ < 0), 134217728));
    while (int_ != 0) {
        j = o7.sub(j, 1);
        buf.put(j, HexDigit.From(o7.mod(int_, 16)));
        int_ = o7.div(int_, 16);
    }

    if (j > 0) {
        k = 0;
        while (j < 9 - 1) {
            buf.put(k, o7.inited(buf.at(j)));
            k = o7.add(k, 1);
            j = o7.add(j, 1);
        }
        buf.put(k, 0x00);
    } else {
        buf[9 - 1] = 0x00;
    }

    Out.String(buf);
}
module.h = h;

function hn(int_) {
    h(int_);
    Out.Ln();
}
module.hn = hn;

function r(frac) {
    Out.Real(frac, 0);
}
module.r = r;

function rn(frac) {
    Out.Real(frac, 0);
    Out.Ln();
}
module.rn = rn;

function b(logic) {
    if (logic) {
        Out.String([84,82,85,69,0]);
    } else {
        Out.String([70,65,76,83,69,0]);
    }
}
module.b = b;

function bn(logic) {
    b(logic);
    Out.Ln();
}
module.bn = bn;

function set(val) {
    var f = o7.array(1);
    var val__prm = o7.array(1);

    function Item(val, val__ai, f, f__ai) {
        var l;

        o7.assert(val.at(val__ai) != 0);
        while (!(o7.in(f.at(f__ai), val.at(val__ai)))) {
            f.inc(f__ai, 1);
        }
        l = o7.inited(f.at(f__ai));
        do {
            val.excl(val__ai, l);
            l = o7.add(l, 1);
        } while (o7.in(l, val.at(val__ai)));
        Out.Int(f.at(f__ai), 0);
        if (o7.cmp(f.at(f__ai), o7.sub(l, 1)) < 0) {
            Out.String([46,46,0]);
            Out.Int(o7.sub(l, 1), 0);
        }
        f.put(f__ai, l);
    }

    val__prm[0] = val;
    if (val__prm[0] == 0) {
        Out.String([123,125,0]);
    } else {
        Out.Char(0x7B);
        f[0] = 0;
        Item(val__prm, 0, f, 0);
        while (val__prm[0] != 0) {
            Out.String([44,32,0]);
            Item(val__prm, 0, f, 0);
        }
        Out.Char(0x7D);
    }
}
module.set = set;

function setn(val) {
    set(val);
    Out.Ln();
}
module.setn = setn;

/* Quote mark - " */
function q() {
    Out.Char(0x22);
}
module.q = q;

function qn() {
    Out.Char(0x22);
    Out.Ln();
}
module.qn = qn;

function n() {
    Out.Ln();
}
module.n = n;

Out.Open();

return module;
})();

/* Copyright 2019,2021 ComdivByZero
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
(function() { 'use strict';

var module = {};
o7.export.CLI = module;

var MaxLen = 4096;
module.MaxLen = MaxLen;

var startCliArg, args, nameInd;

function copy(str, ofs, ofs_ai, argi) {
	var arg, i, len, j, ok;

	j = ofs[ofs_ai];
	o7.assert((0 <= j) && (j < str.length));

	arg = o7.toUtf8(args[argi]);
	len = arg.length - 1;
	ok = j < str.length - len;
	if (ok) {
		i = 0;
		while (i < len) {
			str[j] = arg[i];
			/* предотвращение попадания завершения посреди строки */
			if (str[j] == 0) {
				str[j] = 1;
			}
			i += 1;
			j += 1;
		}
		ofs[ofs_ai] = j;
	}
	str[j] = 0;
	return ok;
}

function GetName(str, ofs, ofs_ai) {
	return copy(str, ofs, ofs_ai, nameInd);
}
module.GetName = GetName;

function Get(str, ofs, ofs_ai, argi) {
	o7.assert((0 <= argi) && (argi < module.count));
	return copy(str, ofs, ofs_ai, argi + startCliArg);
}
module.Get = Get;

function SetExitCode(code) {
	o7.exit_code = code;
}
module.SetExitCode = SetExitCode;

nameInd = 0;
if (typeof process !== 'undefined') {
	args = process.argv;
	nameInd = 1;
} else if (typeof scriptArgs !== 'undefined') {
	args = scriptArgs;
} else {
	args = [" "];
}

if (typeof start_cli_arg !== 'undefined') {
	startCliArg = start_cli_arg;
} else {
	startCliArg = 0;
}
startCliArg += nameInd + 1;
module.count = args.length - startCliArg;

return module;
})();
/* Copyright 2021-2022 ComdivByZero
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
(function() { 'use strict';

var module = {};
o7.export.Uint32 = module;

var assert;

var Size, Max, IntMax, min, max;

assert = o7.assert;

Size = 4;
Max = 0xFFFFFFFF;
IntMax = 0x7FFFFFFF;

min = o7.array(Size);
module.min = min;
max = o7.array(Size);
module.max = max;

module.LittleEndian = 1;
module.BigEndian    = 2;
module.ByteOrder    = 1;

function fromint(v, i) {
	v[0] = i & 0xFF;
	v[1] = (i >> 8) & 0xFF;
	v[2] = (i >> 16) & 0xFF;
	v[3] = i >> 24;
}

function fromnum(v, i) {
	v[0] = i % 0x100;
	i = i / 0x100 | 0;
	v[1] = i & 0xFF;
	v[2] = (i >> 8) & 0xFF;
	v[3] = i >> 16;
}

function toint(v) {
	return v[0] | (v[1] << 8) | (v[2] << 16) | (v[3] << 24);
}

function tonum(v) {
	var n;

	n = toint(v);
	if (v < 0) {
		n += Max + 1;
	}
	return n;
}

function FromInt(v, i) {
	assert(0 <= i);
	fromint(v, i);
}
module.FromInt = FromInt;

function ToInt(v) {
	var i;
	i = toint(v);
	assert(i >= 0);
	return i;
}
module.ToInt = ToInt;

function SwapOrder(v) {
	var b;
	b = v[0]; v[0] = v[3]; v[3] = b;
	b = v[1]; v[1] = v[2]; v[2] = b;
}
module.SwapOrder = SwapOrder;

function Add(sum, a1, a2) {
	var s;

	s = tonum(a1) + tonum(a2);
	assert(s <= Max);
	fromnum(sum, s);
}
module.Add = Add;

function Sub(diff, m, s) {
	var d;

	d = tonum(m) - tonum(s);
	assert(d >= 0);
	fromnum(diff, d);
}
module.Sub = Sub;

function Mul(prod, m1, m2) {
	var p;
	p = tonum(m1) * tonum(m2);
	assert(p <= Max);
	fromnum(prod, p);
}
module.Mul = Mul;

function Div(div, n, d) {
	d = tonum(d);
	assert(d > 0);
	fromnum(div, tonum(n) / d |0);
}
module.Div = Div;

function Mod(mod, n, d) {
	d = tonum(d);
	assert(d > 0);
	fromnum(mod, tonum(n) % d);
}
module.Mod = Mod;

function DivMod(div, mod, n, d) {
	d = tonum(d);
	assert(d > 0);
	fromnum(div, tonum(n) / d |0);
	fromnum(mod, tonum(n) % d);
}
module.DivMod = DivMod;

function Cmp(l, r) {
	var i, cmp;

	i = Size - 1;
	while ((0 < i) && (l[i] == r[i])) {
		i -= 1;
	}
	if (l[i] < r[i]) {
		cmp =  - 1;
	} else if (l[i] > r[i]) {
		cmp = 1;
	} else {
		cmp = 0;
	}
	return cmp;
}
module.Cmp = Cmp;

function init() {
	tonum(min, 0);
	tonum(max, Max);
}

init();

return module;
})();

/* Copyright 2021-2022 ComdivByZero
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
(function() { 'use strict';

var module = {};
o7.export.Int32 = module;

var assert;

var Size, Min, Max, min, max;

assert = o7.assert;

Size = 4;

Min = (1 << (Size * 8 - 2)) * -2;
Max = -1 - Min;

/* TODO */
min = o7.array(Size);
module.min = min;
max = o7.array(Size);
module.max = max;

module.LittleEndian = 1;
module.BigEndian    = 2;
module.ByteOrder    = 1;

function FromInt(v, i) {
	v[0] = i & 0xFF;
	v[1] = (i >> 8) & 0xFF;
	v[2] = (i >> 16) & 0xFF;
	v[3] = (i >> 24) & 0xFF;
}
module.FromInt = FromInt;

function fromint(v, i) {
	assert(Min <= i && i <= Max);
	FromInt(v, i);
}

function toint(v) {
	return v[0] | (v[1] << 8) | (v[2] << 16) | (v[3] << 24);
}

function ToInt(v) {
	var i;
	i = toint(v);
	assert(i != Min);
	return i;
}
module.ToInt = ToInt;

function SwapOrder(v) {
	var b;
	b = v[0]; v[0] = v[3]; v[3] = b;
	b = v[1]; v[1] = v[2]; v[2] = b;
}
module.SwapOrder = SwapOrder;

function Add(sum, a1, a2) {
	fromint(sum, toint(a1) + toint(a2));
}
module.Add = Add;

function Sub(diff, m, s) {
	fromint(diff, toint(m) - toint(s));
}
module.Sub = Sub;

function Mul(prod, m1, m2) {
	fromint(prod, toint(m1) * toint(m2));
}
module.Mul = Mul;

function Div(div, n, d) {
	fromint(div, toint(n) / toint(d) |0);
}
module.Div = Div;

function Mod(mod, n, d) {
	fromint(mod, toint(n) % toint(d));
}
module.Mod = Mod;

function DivMod(div, mod, n, d) {
	n = toint(n);
	d = toint(d);
	FromInt(div, n / d |0);
	FromInt(mod, n % d);
}
module.DivMod = DivMod;

function Cmp(l, r) {
	var c;
	l = toint(l);
	r = toint(r);
	if (l < r) {
		c = -1;
	} else if (l > r) {
		c = 1;
	} else {
		c = 0;
	}
	return c;
}
module.Cmp = Cmp;

function init() {
	fromint(min, Min);
	fromint(max, Max);
}

init();

return module;
})();

/* Generated by Vostok - Oberon-07 translator */

(function() { 'use strict';

var module = {};
o7.export.ArrayCmp = module;


function Bytes(s1, ofs1, s2, ofs2, count) {
    var last;

    o7.assert(count >= 0);
    o7.assert((0 <= ofs1) && (ofs1 <= o7.sub(s1.length, count)));
    o7.assert((0 <= ofs2) && (ofs2 <= o7.sub(s2.length, count)));

    last = o7.sub(o7.add(ofs1, count), 1);
    while ((ofs1 < last) && (s1.at(ofs1) == s2.at(ofs2))) {
        ofs1 = o7.add(ofs1, 1);
        ofs2 = o7.add(ofs2, 1);
    }
    return o7.sub(s1.at(ofs1), s2.at(ofs2));
}
module.Bytes = Bytes;

function Chars(s1, ofs1, s2, ofs2, count) {
    var last;

    o7.assert(count >= 0);
    o7.assert((0 <= ofs1) && (ofs1 <= o7.sub(s1.length, count)));
    o7.assert((0 <= ofs2) && (ofs2 <= o7.sub(s2.length, count)));

    last = o7.sub(o7.add(ofs1, count), 1);
    while ((ofs1 < last) && (s1.at(ofs1) == s2.at(ofs2))) {
        ofs1 = o7.add(ofs1, 1);
        ofs2 = o7.add(ofs2, 1);
    }
    return o7.sub(s1.at(ofs1), s2.at(ofs2));
}
module.Chars = Chars;

function BytesChars(s1, ofs1, s2, ofs2, count) {
    var last;

    o7.assert(count >= 0);
    o7.assert((0 <= ofs1) && (ofs1 <= o7.sub(s1.length, count)));
    o7.assert((0 <= ofs2) && (ofs2 <= o7.sub(s2.length, count)));

    last = o7.sub(o7.add(ofs1, count), 1);
    while ((ofs1 < last) && (s1.at(ofs1) == s2.at(ofs2))) {
        ofs1 = o7.add(ofs1, 1);
        ofs2 = o7.add(ofs2, 1);
    }
    return o7.sub(s1.at(ofs1), s2.at(ofs2));
}
module.BytesChars = BytesChars;

return module;
})();

/* Generated by Vostok - Oberon-07 translator */

(function() { 'use strict';
var Stream = o7.import.VDataStream;
var Uint32 = o7.import.Uint32;
var Int32 = o7.import.Int32;
var ArrayCmp = o7.import.ArrayCmp;

var module = {};
o7.export.VStreamRead = module;


function Byte(in_, b, b__ai) {
    var buf = o7.array(1);
    var ok;

    ok = 1 == Stream.ReadWhole(in_, buf);
    if (ok) {
        b.put(b__ai, o7.inited(buf[0]));
    }
    return ok;
}
module.Byte = Byte;

function LeUint32(in_, u) {
    var ok;

    ok = 4 == Stream.ReadWhole(in_, u);
    if ((Uint32.ByteOrder == Uint32.BigEndian) && ok) {
        Uint32.SwapOrder(u);
    }
    return ok;
}
module.LeUint32 = LeUint32;

function LeUinteger(in_, i, i__ai) {
    var u = o7.array(4);
    var ok;

    ok = (4 == Stream.ReadWhole(in_, u)) && (u[3] < 128);
    if (ok) {
        if (Uint32.ByteOrder == Uint32.BigEndian) {
            Uint32.SwapOrder(u);
        }
        i.put(i__ai, Uint32.ToInt(u));
    }
    return ok;
}
module.LeUinteger = LeUinteger;

function LeInt32(in_, i32) {
    var ok;

    ok = 4 == Stream.ReadWhole(in_, i32);
    if ((Int32.ByteOrder == Int32.BigEndian) && ok) {
        Int32.SwapOrder(i32);
    }
    return ok;
}
module.LeInt32 = LeInt32;

function LeInteger(in_, i, i__ai) {
    var i32 = o7.array(4);
    var ok;

    ok = LeInt32(in_, i32) && (0 != Int32.Cmp(Int32.min, i32));
    if (ok) {
        i.put(i__ai, Int32.ToInt(i32));
    }
    return ok;
}
module.LeInteger = LeInteger;

function SameChars(in_, sample, ofs, count) {
    var buf = o7.array(64);

    o7.assert(sample.at(o7.sub(sample.length, 1)) == 0x00);
    o7.assert(ofs >= 0);
    o7.assert(count >= 0);
    o7.assert(ofs <= o7.sub(sample.length, count));

    while ((count > 64) && (Stream.ReadCharsWhole(in_, buf) == 64) && (ArrayCmp.Chars(buf, 0, sample, ofs, 64) == 0)) {
        count = o7.sub(count, 64);
        ofs = o7.add(ofs, 1);
    }
    return (count <= 64) && (count == Stream.ReadChars(in_, buf, 0, count)) && (ArrayCmp.Chars(buf, 0, sample, ofs, count) == 0);
}
module.SameChars = SameChars;

function Skip(in_, count) {
    return count == Stream.Skip(in_, count);
}
module.Skip = Skip;

/* Читает до байта=end, но не больше count. Возвращает последний прочитанный байт */
function SkipUntil(in_, end, count, count__ai) {
    var b = o7.array(1);
    var rest;
    var last;

    o7.assert(o7.cmp(count.at(count__ai), 0) >= 0);

    rest = o7.inited(count.at(count__ai));
    if ((rest == 0) || (Stream.ReadWhole(in_, b) < 1)) {
        last = 256;
    } else {
        rest = o7.sub(rest, 1);
        while ((b[0] != end) && (rest > 0) && (Stream.ReadWhole(in_, b) == 1)) {
            rest = o7.sub(rest, 1);
        }
        last = o7.inited(b[0]);
    }
    count.inc(count__ai, -(rest));
    return last;
}
module.SkipUntil = SkipUntil;

function UntilChar(in_, end, count, out, ofs, ofs__ai) {
    var i;
    var last;

    o7.assert(count >= 0);
    o7.assert((o7.cmp(0, ofs.at(ofs__ai)) <= 0) && (o7.cmp(ofs.at(ofs__ai), o7.sub(out.length, count)) <= 0));

    i = o7.inited(ofs.at(ofs__ai));
    if ((count == 0) || (Stream.ReadChars(in_, out, i, 1) < 1)) {
        last = o7.itc(o7.sub(255, o7.bti(end == 0xFF)));
    } else {
        count = o7.sub(count, 1);
        while (((0xFF & out.at(i)) != (0xFF & end)) && (count > 0) && (Stream.ReadChars(in_, out, o7.add(i, 1), 1) == 1)) {
            i = o7.add(i, 1);
            count = o7.sub(count, 1);
        }
        last = o7.inited(out.at(i));
        ofs.put(ofs__ai, o7.add(i, 1));
    }
    return last;
}
module.UntilChar = UntilChar;

return module;
})();

/* Generated by Vostok - Oberon-07 translator */

(function() { 'use strict';

var module = {};
o7.export.OldCharsetWindows1251ToUnicode = module;

var Supported = true;
module.Supported = Supported;

function Do(wc) {
    var uc;

    o7.assert(o7.div(wc, 256) == 0);

    if (wc < 128) {
        uc = wc;
    } else if (wc >= 192) {
        uc = o7.add(wc, (1040 - 192));
    } else {
        switch (wc) {
        case 128:
            uc = 1026;
            break;
        case 129:
            /* Ђ */
            uc = 1027;
            break;
        case 130:
            /* Ѓ */
            uc = 8218;
            break;
        case 131:
            /* ‚ */
            uc = 1107;
            break;
        case 132:
            /* ѓ */
            uc = 8222;
            break;
        case 133:
            /* „ */
            uc = 8230;
            break;
        case 134:
            /* … */
            uc = 8224;
            break;
        case 135:
            /* † */
            uc = 8225;
            break;
        case 136:
            /* ‡ */
            uc = 8364;
            break;
        case 137:
            /* € */
            uc = 8240;
            break;
        case 138:
            /* ‰ */
            uc = 1033;
            break;
        case 139:
            /* Љ */
            uc = 8249;
            break;
        case 140:
            /* ‹ */
            uc = 1034;
            break;
        case 141:
            /* Њ */
            uc = 1036;
            break;
        case 142:
            /* Ќ */
            uc = 1035;
            break;
        case 143:
            /* Ћ */
            uc = 1039;
            break;
        case 144:
            /* Џ */
            uc = 1106;
            break;
        case 145:
            /* ђ */
            uc = 8216;
            break;
        case 146:
            /* ‘ */
            uc = 8217;
            break;
        case 147:
            /* ’ */
            uc = 8220;
            break;
        case 148:
            /* “ */
            uc = 8221;
            break;
        case 149:
            /* ” */
            uc = 8226;
            break;
        case 150:
            /* • */
            uc = 8211;
            break;
        case 151:
            /* – */
            uc = 8212;
            break;
        case 152:
            /* — */
            uc = 65535;
            break;
        case 153:
            /* 98H отсутствует в самой Windows1251 */
            uc = 8482;
            break;
        case 154:
            /* ™ */
            uc = 1113;
            break;
        case 155:
            /* љ */
            uc = 8250;
            break;
        case 156:
            /* › */
            uc = 1114;
            break;
        case 157:
            /* њ */
            uc = 1116;
            break;
        case 158:
            /* ќ */
            uc = 1115;
            break;
        case 159:
            /* ћ */
            uc = 1119;
            break;
        case 160:
            /* џ */
            uc = 160;
            break;
        case 161:
            /* Неразрывный пробел */
            uc = 1038;
            break;
        case 162:
            /* Ў */
            uc = 1118;
            break;
        case 163:
            /* ў */
            uc = 1032;
            break;
        case 164:
            /* Ј */
            uc = 164;
            break;
        case 165:
            /* ¤ */
            uc = 1168;
            break;
        case 166:
            /* Ґ */
            uc = 166;
            break;
        case 167:
            /* ¦ */
            uc = 167;
            break;
        case 168:
            /* § */
            uc = 1025;
            break;
        case 169:
            /* Ё */
            uc = 169;
            break;
        case 170:
            /* © */
            uc = 1028;
            break;
        case 171:
            /* Є */
            uc = 171;
            break;
        case 172:
            /* « */
            uc = 172;
            break;
        case 173:
            /* ¬ */
            uc = 173;
            break;
        case 174:
            /* мягкий перенос */
            uc = 174;
            break;
        case 175:
            /* ® */
            uc = 1031;
            break;
        case 176:
            /* Ї */
            uc = 176;
            break;
        case 177:
            /* ° */
            uc = 177;
            break;
        case 178:
            /* ± */
            uc = 1030;
            break;
        case 179:
            /* І */
            uc = 1110;
            break;
        case 180:
            /* і */
            uc = 1169;
            break;
        case 181:
            /* ґ */
            uc = 181;
            break;
        case 182:
            /* µ */
            uc = 182;
            break;
        case 183:
            /* ¶ */
            uc = 183;
            break;
        case 184:
            /* · */
            uc = 1105;
            break;
        case 185:
            /* ё */
            uc = 8470;
            break;
        case 186:
            /* № */
            uc = 1108;
            break;
        case 187:
            /* є */
            uc = 187;
            break;
        case 188:
            /* » */
            uc = 1112;
            break;
        case 189:
            /* ј */
            uc = 1029;
            break;
        case 190:
            /* Ѕ */
            uc = 1109;
            break;
        case 191:
            /* ѕ */
            uc = 1111;
            break;
        default:
            o7.caseFail(wc);
            break;
        }
    }
    return uc;
}
module.Do = Do;

return module;
})();

/* Generated by Vostok - Oberon-07 translator */

(function() { 'use strict';

var module = {};
o7.export.OldCharsetWindows1251ToUtf8 = module;

var Supported = true;
module.Supported = Supported;

function Two(out, i, i__ai, c0, c1) {
    var ok;

    ok = o7.cmp(i.at(i__ai), o7.sub(out.length, 2)) < 0;
    if (ok) {
        out.put(i.at(i__ai), c0);
        out.put(o7.add(i.at(i__ai), 1), c1);
        i.inc(i__ai, 2);
    }
    return ok;
}

function Three(out, i, i__ai, c0, c1, c2) {
    var ok;

    ok = o7.cmp(i.at(i__ai), o7.sub(out.length, 3)) < 0;
    if (ok) {
        out.put(i.at(i__ai), c0);
        out.put(o7.add(i.at(i__ai), 1), c1);
        out.put(o7.add(i.at(i__ai), 2), c2);
        i.inc(i__ai, 3);
    }
    return ok;
}

function Do(out, ofs, ofs__ai, wc) {
    var ok;

    o7.assert(o7.div(wc, 256) == 0);
    o7.assert((o7.cmp(0, ofs.at(ofs__ai)) <= 0) && (o7.cmp(ofs.at(ofs__ai), o7.sub(out.length, 1)) < 0));

    if (wc < 128) {
        ok = o7.cmp(ofs.at(ofs__ai), out.length) < 0;
        if (ok) {
            out.put(ofs.at(ofs__ai), o7.itc(wc));
            ofs.inc(ofs__ai, 1);
        }
    } else if (wc >= 192) {
        if (wc < 240) {
            ok = Two(out, ofs, ofs__ai, 0xD0, o7.itc(o7.add(wc, (1040 - 192 - 1024 + 128))));
        } else {
            ok = Two(out, ofs, ofs__ai, 0xD1, o7.itc(o7.add(wc, (1040 - 192 - 1088 + 128))));
        }
    } else {
        switch (wc) {
        case 128:
            ok = Two(out, ofs, ofs__ai, 0xD0, 0x82);
            break;
        case 129:
            ok = Two(out, ofs, ofs__ai, 0xD0, 0x83);
            break;
        case 130:
            ok = Three(out, ofs, ofs__ai, 0xE2, 0x80, 0x9A);
            break;
        case 131:
            ok = Two(out, ofs, ofs__ai, 0xD1, 0x93);
            break;
        case 132:
            ok = Three(out, ofs, ofs__ai, 0xE2, 0x80, 0x9E);
            break;
        case 133:
            ok = Three(out, ofs, ofs__ai, 0xE2, 0x80, 0xA6);
            break;
        case 134:
            ok = Three(out, ofs, ofs__ai, 0xE2, 0x80, 0xA0);
            break;
        case 135:
            ok = Three(out, ofs, ofs__ai, 0xE2, 0x80, 0xA1);
            break;
        case 136:
            ok = Three(out, ofs, ofs__ai, 0xE2, 0x82, 0xAC);
            break;
        case 137:
            ok = Three(out, ofs, ofs__ai, 0xE2, 0x80, 0xB0);
            break;
        case 138:
            ok = Two(out, ofs, ofs__ai, 0xD0, 0x89);
            break;
        case 139:
            ok = Three(out, ofs, ofs__ai, 0xE2, 0x80, 0xB9);
            break;
        case 140:
            ok = Two(out, ofs, ofs__ai, 0xD0, 0x8A);
            break;
        case 141:
            ok = Two(out, ofs, ofs__ai, 0xD0, 0x8C);
            break;
        case 142:
            ok = Two(out, ofs, ofs__ai, 0xD0, 0x8B);
            break;
        case 143:
            ok = Two(out, ofs, ofs__ai, 0xD0, 0x8F);
            break;
        case 144:
            ok = Two(out, ofs, ofs__ai, 0xD1, 0x92);
            break;
        case 145:
            ok = Three(out, ofs, ofs__ai, 0xE2, 0x80, 0x98);
            break;
        case 146:
            ok = Three(out, ofs, ofs__ai, 0xE2, 0x80, 0x99);
            break;
        case 147:
            ok = Three(out, ofs, ofs__ai, 0xE2, 0x80, 0x9C);
            break;
        case 148:
            ok = Three(out, ofs, ofs__ai, 0xE2, 0x80, 0x9D);
            break;
        case 149:
            ok = Three(out, ofs, ofs__ai, 0xE2, 0x80, 0xA2);
            break;
        case 150:
            ok = Three(out, ofs, ofs__ai, 0xE2, 0x80, 0x93);
            break;
        case 151:
            ok = Three(out, ofs, ofs__ai, 0xE2, 0x80, 0x94);
            break;
        case 152:
            ok = Three(out, ofs, ofs__ai, 0xEF, 0xBF, 0xBF);
            break;
        case 153:
            ok = Three(out, ofs, ofs__ai, 0xE2, 0x84, 0xA2);
            break;
        case 154:
            ok = Two(out, ofs, ofs__ai, 0xD1, 0x99);
            break;
        case 155:
            ok = Three(out, ofs, ofs__ai, 0xE2, 0x80, 0xBA);
            break;
        case 156:
            ok = Two(out, ofs, ofs__ai, 0xD1, 0x9A);
            break;
        case 157:
            ok = Two(out, ofs, ofs__ai, 0xD1, 0x9C);
            break;
        case 158:
            ok = Two(out, ofs, ofs__ai, 0xD1, 0x9B);
            break;
        case 159:
            ok = Two(out, ofs, ofs__ai, 0xD1, 0x9F);
            break;
        case 160:
            ok = Two(out, ofs, ofs__ai, 0xC2, 0xA0);
            break;
        case 161:
            ok = Two(out, ofs, ofs__ai, 0xD0, 0x8E);
            break;
        case 162:
            ok = Two(out, ofs, ofs__ai, 0xD1, 0x9E);
            break;
        case 163:
            ok = Two(out, ofs, ofs__ai, 0xD0, 0x88);
            break;
        case 164:
            ok = Two(out, ofs, ofs__ai, 0xC2, 0xA4);
            break;
        case 165:
            ok = Two(out, ofs, ofs__ai, 0xD2, 0x90);
            break;
        case 166:
            ok = Two(out, ofs, ofs__ai, 0xC2, 0xA6);
            break;
        case 167:
            ok = Two(out, ofs, ofs__ai, 0xC2, 0xA7);
            break;
        case 168:
            ok = Two(out, ofs, ofs__ai, 0xD0, 0x81);
            break;
        case 169:
            ok = Two(out, ofs, ofs__ai, 0xC2, 0xA9);
            break;
        case 170:
            ok = Two(out, ofs, ofs__ai, 0xD0, 0x84);
            break;
        case 171:
            ok = Two(out, ofs, ofs__ai, 0xC2, 0xAB);
            break;
        case 172:
            ok = Two(out, ofs, ofs__ai, 0xC2, 0xAC);
            break;
        case 173:
            ok = Two(out, ofs, ofs__ai, 0xC2, 0xAD);
            break;
        case 174:
            ok = Two(out, ofs, ofs__ai, 0xC2, 0xAE);
            break;
        case 175:
            ok = Two(out, ofs, ofs__ai, 0xD0, 0x87);
            break;
        case 176:
            ok = Two(out, ofs, ofs__ai, 0xC2, 0xB0);
            break;
        case 177:
            ok = Two(out, ofs, ofs__ai, 0xC2, 0xB1);
            break;
        case 178:
            ok = Two(out, ofs, ofs__ai, 0xD0, 0x86);
            break;
        case 179:
            ok = Two(out, ofs, ofs__ai, 0xD1, 0x96);
            break;
        case 180:
            ok = Two(out, ofs, ofs__ai, 0xD2, 0x91);
            break;
        case 181:
            ok = Two(out, ofs, ofs__ai, 0xC2, 0xB5);
            break;
        case 182:
            ok = Two(out, ofs, ofs__ai, 0xC2, 0xB6);
            break;
        case 183:
            ok = Two(out, ofs, ofs__ai, 0xC2, 0xB7);
            break;
        case 184:
            ok = Two(out, ofs, ofs__ai, 0xD1, 0x91);
            break;
        case 185:
            ok = Three(out, ofs, ofs__ai, 0xE2, 0x84, 0x96);
            break;
        case 186:
            ok = Two(out, ofs, ofs__ai, 0xD1, 0x94);
            break;
        case 187:
            ok = Two(out, ofs, ofs__ai, 0xC2, 0xBB);
            break;
        case 188:
            ok = Two(out, ofs, ofs__ai, 0xD1, 0x98);
            break;
        case 189:
            ok = Two(out, ofs, ofs__ai, 0xD0, 0x85);
            break;
        case 190:
            ok = Two(out, ofs, ofs__ai, 0xD1, 0x95);
            break;
        case 191:
            ok = Two(out, ofs, ofs__ai, 0xD1, 0x97);
            break;
        default:
            o7.caseFail(wc);
            break;
        }
    }
    return ok;
}
module.Do = Do;

return module;
})();

/* Generated by Vostok - Oberon-07 translator */

(function() { 'use strict';
var toUnicode = o7.import.OldCharsetWindows1251ToUnicode;
var toUtf8 = o7.import.OldCharsetWindows1251ToUtf8;
var Utf8 = o7.import.Utf8;

var module = {};
o7.export.OldCharsetWindows1251 = module;

var Supported = toUnicode.Supported || toUtf8.Supported;
module.Supported = Supported;

function ToUnicode(wc) {
    var code;
    var b = o7.array(4);
    var l = o7.array(1);
    var r = new Utf8.R ();

    if (toUnicode.Supported) {
        code = toUnicode.Do(wc);
    } else {
        l[0] = 0;
        o7.assert(toUtf8.Do(b, l, 0, wc));
        o7.assert(!(Utf8.Begin(r, b[0]) && Utf8.Next(r, b[1]) && Utf8.Next(r, b[2]) && Utf8.Next(r, b[3])));
        code = o7.inited(r.val[0]);
    }
    return code;
}
module.ToUnicode = ToUnicode;

function ToUtf8(out, ofs, ofs__ai, wc) {
    var ok;

    if (toUtf8.Supported) {
        ok = toUtf8.Do(out, ofs, ofs__ai, wc);
    } else {
        ok = Utf8.FromCode(out, ofs, ofs__ai, toUnicode.Do(wc));
    }
    return ok;
}
module.ToUtf8 = ToUtf8;

return module;
})();

/* Generated by Vostok - Oberon-07 translator */

(function() { 'use strict';
var Stream = o7.import.VDataStream;
var Read = o7.import.VStreamRead;
var Charz = o7.import.Charz;
var TypesLimits = o7.import.TypesLimits;
var Utf8 = o7.import.Utf8;
var Windows1251 = o7.import.OldCharsetWindows1251;

var module = {};
o7.export.Odc = module;

var Version = [48,46,52,0];
module.Version = Version;

var Nil = 128;
module.Nil = Nil;
var Link = 129;
module.Link = Link;
var Store = 130;
module.Store = Store;
var Elem = 131;
module.Elem = Elem;
var NewLink = 132;
module.NewLink = NewLink;

var Data = 256;
module.Data = Data;
/* Специальный идентификатор неинтерпретируемых данных */

var NewBase = 240;
module.NewBase = NewBase;
var NewExt = 241;
module.NewExt = NewExt;
var OldType = 242;
module.OldType = OldType;

var FormatTag = [67,68,79,111,0];
module.FormatTag = FormatTag;

var TypeNameLen = 63;

var BlockSize = 4096;

var PieceView = 0;
var PieceChar1 = 1;
var PieceChar2 = 2;

var BlackboxReplacementMin = 0x8B;
var SpaceZeroWidth = 0x8B;
var DigitSpace = 0x8F;
var Hyphen = 0x90;
var NonBreakingHyphen = 0x91;
var BlackboxReplacementMax = 0x91;

var CodeFigureSpace = 8199;
var CodeSpaceZeroWidth = 8203;
var CodeHyphen = 8208;
var CodeNonBreakingHyphen = 8209;

var SkipEmbeddedView = 0;
module.SkipEmbeddedView = SkipEmbeddedView;
var SkipOberonComment = 1;
module.SkipOberonComment = SkipOberonComment;
var InputWindows1251 = 2;
module.InputWindows1251 = InputWindows1251;
var LastCharNewLine = 3;
module.LastCharNewLine = LastCharNewLine;
var WriteDescriptors = 4;
module.WriteDescriptors = WriteDescriptors;
var LastOption = 4;
module.LastOption = LastOption;

var StructDeepMax = 256;
var ReadStruct__ReadObject__ReadStdModel__ReadMeta__AttrEnd = 255;

function Anon__0000() {
    this.name = o7.array(1);
    this.base = NaN;
}
Anon__0000.prototype.assign = function(r) {
    o7.copy(this.name, r.name);
    this.base = r.base;
}
function Options() {
    this.commanderReplacement = o7.array(64);
    this.cmdLen = NaN;
    this.tab = o7.array(16);
    this.tabLen = NaN;
    this.set = o7.array(1);
}
Options.prototype.assign = function(r) {
    o7.copy(this.commanderReplacement, r.commanderReplacement);
    this.cmdLen = r.cmdLen;
    o7.copy(this.tab, r.tab);
    this.tabLen = r.tabLen;
    o7.copy(this.set, r.set);
}
module.Options = Options;
module.Options = Options;

function Types() {
    this.desc = o7.arrayOfRec(256, Anon__0000);
    this.names = o7.array(8192);
    this.top = NaN;
    this.currentDesc = NaN;
    this.textModelsStdModel = o7.array(1);
    this.devCommandersStdView = o7.array(1);
    this.structDeep = NaN;
}
Types.prototype.assign = function(r) {
    o7.copyAor(this.desc, r.desc);
    o7.copy(this.names, r.names);
    this.top = r.top;
    this.currentDesc = r.currentDesc;
    o7.copy(this.textModelsStdModel, r.textModelsStdModel);
    o7.copy(this.devCommandersStdView, r.devCommandersStdView);
    this.structDeep = r.structDeep;
}
function Block() {
    this.data = o7.array(BlockSize - 32);
    this.used = NaN;
    this.next = o7.array(1);
}
Block.prototype.assign = function(r) {
    o7.copy(this.data, r.data);
    this.used = r.used;
    o7.copy(this.next, r.next);
}
function Piece() {
    this.block = undefined;
    this.ofs = NaN;
    this.size = NaN;


    this.next = undefined;


    this.kind = NaN;
    this.view = o7.array(1);
}
Piece.prototype.assign = function(r) {
    this.block = r.block;
    this.ofs = r.ofs;
    this.size = r.size;
    this.next = r.next;
    this.kind = r.kind;
    o7.copy(this.view, r.view);
}
function Struct() {
    this.kind = NaN;


    this.data = o7.array(1);
    this.object = o7.array(1);


    this.next = o7.array(1);
}
Struct.prototype.assign = function(r) {
    this.kind = r.kind;
    o7.copy(this.data, r.data);
    o7.copy(this.object, r.object);
    o7.copy(this.next, r.next);
}

function Object() {
    this.type = NaN;
    this.first = o7.array(1);
    this.last = undefined;
}
Object.prototype.assign = function(r) {
    this.type = r.type;
    o7.copy(this.first, r.first);
    this.last = r.last;
}

function Text() {
    Object.call(this);
    this.pieces = o7.array(1);
}
o7.extend(Text, Object);
Text.prototype.assign = function(r) {
    Object.prototype.assign.call(this, r);
    o7.copy(this.pieces, r.pieces);
}

function Document() {
    this.types = new Types ();


    this.struct_ = new Struct ();
}
Document.prototype.assign = function(r) {
    this.types.assign(r.types);
    this.struct_.assign(r.struct_);
}
module.Document = Document;

function PrintContext() {
    this.prevChar = NaN;
    this.commentsDeep = NaN;


    this.opt = new Options ();
}
PrintContext.prototype.assign = function(r) {
    this.prevChar = r.prevChar;
    this.commentsDeep = r.commentsDeep;
    this.opt.assign(r.opt);
}

function TypesInit(t) {
    t.top = 0;
    t.textModelsStdModel[0] =  - 1;
    t.devCommandersStdView[0] =  - 1;
    t.structDeep = 0;
    t.desc[0].name[0] = 0;
    o7.strcpy(t.names, [0]);
}

function BlockNew(b, b__ai) {
    b.put(b__ai, new Block());
    if (b.at(b__ai) != null) {
        b.at(b__ai).used = 0;
        b.at(b__ai).next[0] = null;
    }
    return b.at(b__ai) != null;
}

function PieceNew(b, b__ai, size, charSize, p, p__ai) {
    var ok;

    o7.assert(size > 0);
    o7.assert(o7.in(charSize, ((1 << PieceChar1) | (1 << PieceChar2))));

    p.put(p__ai, new Piece());
    ok = (p.at(p__ai) != null) && ((b.at(b__ai) != null) || BlockNew(b, b__ai));
    if (ok) {
        p.at(p__ai).kind = o7.itb(charSize);
        p.at(p__ai).size = size;
        p.at(p__ai).block = b.at(b__ai);
        p.at(p__ai).ofs = o7.inited(b.at(b__ai).used);

        if (size >= o7.sub(BlockSize - 32, b.at(b__ai).used)) {
            size = o7.sub(size, o7.sub(BlockSize - 32, b.at(b__ai).used));
            b.at(b__ai).used = BlockSize - 32;
        } else {
            b.at(b__ai).used = o7.add(b.at(b__ai).used, size);
            size = 0;
        }

        while (ok && (size >= BlockSize - 32)) {
            ok = BlockNew(b.at(b__ai).next, 0);
            if (ok) {
                b.put(b__ai, b.at(b__ai).next[0]);
                b.at(b__ai).used = BlockSize - 32;
                size = o7.sub(size, BlockSize - 32);
            }
        }

        if (ok && (size > 0)) {
            ok = BlockNew(b.at(b__ai).next, 0);
            if (ok) {
                b.put(b__ai, b.at(b__ai).next[0]);
                b.at(b__ai).used = size;
            }
        }

        b.at(b__ai).used = o7.add(b.at(b__ai).used, o7.mod(b.at(b__ai).used, 2));
        if (o7.cmp(b.at(b__ai).used, BlockSize - 32) == 0) {
            b.put(b__ai, null);
        }
    }
    if (!ok) {
        p.put(p__ai, null);
    }
    return ok;
}

function PieceViewNew(p, p__ai) {
    p.put(p__ai, new Piece());
    if (p.at(p__ai) != null) {
        p.at(p__ai).size =  - 1;
        p.at(p__ai).block = null;
        p.at(p__ai).ofs =  - 1;
        p.at(p__ai).next = null;
        p.at(p__ai).kind = PieceView;
        p.at(p__ai).view[0] = null;
    }
    return p.at(p__ai) != null;
}

function ReadIntro(in_) {
    var version = o7.array(1);

    return Read.SameChars(in_, [67,68,79,111,0], 0, 5 - 1) && Read.LeUinteger(in_, version, 0) && (o7.cmp(version[0], 0) == 0);
}

function ReadNext(in_, comment, comment__ai, next, next__ai) {
    return Read.LeUinteger(in_, comment, comment__ai) && Read.LeUinteger(in_, next, next__ai);
}

function ReadEndNext(in_, next, next__ai) {
    var ok;
    var comment = o7.array(1);

    ok = ReadNext(in_, comment, 0, next, next__ai);
    if (ok && (o7.cmp(next.at(next__ai), 0) == 0) && !(comment[0] % 2 != 0)) {
        next.put(next__ai,  - 1);
    }
    return ok;
}

function ReadMidNext(in_, next, next__ai) {
    var comment = o7.array(1);

    return ReadNext(in_, comment, 0, next, next__ai) && ((o7.cmp(next.at(next__ai), 0) > 0) || !(comment[0] % 2 != 0));
}

function SetBase(types, prev, id) {
    if (prev >= 0) {
        types.desc.at(prev).base = id;
    } else {
        types.currentDesc = id;
    }
}

function ReadPath(in_, types, size, size__ai, rest) {
    var id = o7.array(1);
    var ok;
    var ignore;
    var tid = o7.array(1);
    var prev = o7.array(1);
    var s = o7.array(1);

    function Identify(typeIndex, typeIndex__ai, types, name) {
        var match;

        match = (o7.cmp(typeIndex.at(typeIndex__ai), 0) < 0) && (0 == Charz.Compare(types.names, types.desc.at(types.currentDesc).name[0], name, 0));
        if (match) {
            typeIndex.put(typeIndex__ai, o7.inited(types.currentDesc));
        }
        return match;
    }

    function ReadBase(in_, size, size__ai, types, prev, prev__ai) {
        var ok;

        SetBase(types, prev.at(prev__ai), types.top);
        prev.put(prev__ai, o7.inited(types.top));
        types.top = o7.add(types.top, 1);
        ok = (o7.cmp(types.top, 256) < 0) && (o7.cmp(types.desc.at(prev.at(prev__ai)).name[0], 8192 - TypeNameLen - 2) < 0);
        if (ok) {
            types.desc.at(types.top).name[0] = o7.inited(types.desc.at(prev.at(prev__ai)).name[0]);
            ok = 0x00 == Read.UntilChar(in_, 0x00, TypeNameLen + 1, types.names, types.desc.at(types.top).name, 0);
            size.inc(size__ai, o7.sub(types.desc.at(types.top).name[0], types.desc.at(prev.at(prev__ai)).name[0]));
        }
        return ok;
    }

    prev[0] =  - 1;
    ok = Read.Byte(in_, id, 0);
    s[0] = 1;
    while (ok && (id[0] == NewExt)) {
        ok = ReadBase(in_, s, 0, types, prev, 0) && Read.Byte(in_, id, 0);
        if (ok) {
            s.inc(0, 1);
        }
    }
    tid[0] =  - 1;
    if (!ok) {
    } else if (id[0] == NewBase) {
        ok = ReadBase(in_, s, 0, types, prev, 0);
    } else {
        ok = (id[0] == OldType) && Read.LeUinteger(in_, tid, 0) && (o7.cmp(tid[0], types.top) < 0);
        s.inc(0, 4);
        SetBase(types, prev[0], tid[0]);
    }
    size.put(size__ai, o7.inited(s[0]));

    if (ok) {
        ignore = Identify(types.textModelsStdModel, 0, types, [84,101,120,116,77,111,100,101,108,115,46,83,116,100,77,111,100,101,108,68,101,115,99,0]) || Identify(types.devCommandersStdView, 0, types, [68,101,118,67,111,109,109,97,110,100,101,114,115,46,83,116,100,86,105,101,119,68,101,115,99,0]);
    }
    return ok;
}

function ReadNil(in_, n, n__ai) {
    return ReadEndNext(in_, n, n__ai);
}

function ReadLink(in_, new_, n, n__ai) {
    var lid = o7.array(1);

    return Read.LeUinteger(in_, lid, 0) && ReadEndNext(in_, n, n__ai);
}

function ObjInit(obj, type) {
    o7.assert(type >= 0);

    obj.type = type;
    obj.first[0] = null;
    obj.last = null;
}

function ObjNew(obj, obj__ai, type) {
    obj.put(obj__ai, new Object());
    if (obj.at(obj__ai) != null) {
        ObjInit(obj.at(obj__ai), type);
    }
    return obj.at(obj__ai) != null;
}

function TextNew(obj, obj__ai, types) {
    obj.put(obj__ai, new Text());
    if (obj.at(obj__ai) != null) {
        ObjInit(obj.at(obj__ai), types.textModelsStdModel[0]);
    }
    return obj.at(obj__ai) != null;
}

function ReadPieces(in_, p) {
    var ok;
    var ofs;
    var size;
    var b;
    var viewcode = o7.array(1);

    ok = true;
    while ((p != null) && ok) {
        b = p.block;
        size = o7.inited(p.size);
        if (size <= 0) {
            ok = Read.Byte(in_, viewcode, 0) && (viewcode[0] == 2);
        } else {
            ofs = o7.inited(p.ofs);
            if (size <= o7.sub(BlockSize - 32, ofs)) {
                ok = size == Stream.ReadChars(in_, b.data, ofs, size);
            } else {
                ok = o7.sub(BlockSize - 32, ofs) == Stream.ReadChars(in_, b.data, ofs, o7.sub(BlockSize - 32, ofs));
                size = o7.sub(size, o7.sub(BlockSize - 32, ofs));
                while (ok && (size > BlockSize - 32)) {
                    size = o7.sub(size, BlockSize - 32);
                    b = b.next[0];
                    ok = BlockSize - 32 == Stream.ReadCharsWhole(in_, b.data);
                }
                b = b.next[0];
                ok = ok && (size == Stream.ReadChars(in_, b.data, 0, size));
            }
        }
        p = p.next;
    }
    return ok;
}

function ReadData(in_, block, block__ai, size, struct_, struct__ai) {
    var ok;

    struct_.put(struct__ai, new Struct());
    ok = (struct_.at(struct__ai) != null) && PieceNew(block, block__ai, size, PieceChar1, struct_.at(struct__ai).data, 0) && ReadPieces(in_, struct_.at(struct__ai).data[0]);
    if (ok) {
        struct_.at(struct__ai).kind = Data;
        struct_.at(struct__ai).object[0] = null;
    }
    return ok;
}

function ReadStruct(in_, types, block, block__ai, next, next__ai, size, size__ai, rest, struct_) {
    var id = o7.array(1);
    var ok;

    function ReadObject(in_, types, block, block__ai, next, next__ai, size, size__ai, rest, obj, obj__ai) {
        var ok;
        var pathSize = o7.array(1);
        var begin = o7.array(1);
        var content = o7.array(1);

        function ReadStdModel(in_, types, block, block__ai, rest, obj, obj__ai) {
            var ok;
            var metaSize = o7.array(1);
            var txt = o7.array(1);

            function ReadMeta(in_, types, block, block__ai, ps, ps__ai, metaSize, rest) {
                var ok;
                var last;
                var curr = o7.array(1);
                var textLen = o7.array(1);
                var attrTop;
                var next = o7.array(1);
                var size = o7.array(1);
                var attrNum = o7.array(1);
                var struct_ = new Struct ();

                function ReadView(in_, types, block, block__ai, next, next__ai, size, size__ai, rest, obj, obj__ai) {
                    var width = o7.array(1);
                    var height = o7.array(1);
                    var ok;
                    var struct_ = new Struct ();

                    size.put(size__ai, 0);
                    ok = (rest > 8) && Read.LeUinteger(in_, width, 0) && Read.LeUinteger(in_, height, 0) && ReadStruct(in_, types, block, block__ai, next, next__ai, size, size__ai, o7.sub(rest, 8), struct_);
                    if (ok) {
                        size.inc(size__ai, 8);
                        obj.put(obj__ai, struct_.object[0]);
                    }
                    return ok;
                }

                last = null;

                attrTop = 0;

                ok = Read.Byte(in_, attrNum, 0) && ((attrNum[0] < 128) || (attrNum[0] == ReadStruct__ReadObject__ReadStdModel__ReadMeta__AttrEnd));
                while (ok && (attrNum[0] <= attrTop)) {
                    metaSize = o7.sub(metaSize, 5);
                    if (attrNum[0] == attrTop) {
                        ok = ReadStruct(in_, types, block, block__ai, next, 0, size, 0, metaSize, struct_);
                        metaSize = o7.sub(metaSize, size[0]);
                        attrTop = o7.add(attrTop, 1);
                    }
                    ok = ok && (metaSize > 0) && Read.LeInteger(in_, textLen, 0);
                    if (!ok) {
                    } else if (o7.cmp(textLen[0], 0) == 0) {
                        rest = o7.sub(rest, 1);
                        ok = (rest >= 0) && PieceViewNew(curr, 0) && ReadView(in_, types, block, block__ai, next, 0, size, 0, metaSize, curr[0].view, 0);
                        if (ok) {
                            metaSize = o7.sub(metaSize, size[0]);
                        }
                    } else {
                        rest = o7.sub(rest, Math.abs(textLen[0]));
                        ok = (rest >= 0) && PieceNew(block, block__ai, Math.abs(textLen[0]), o7.add(PieceChar1, o7.bti(o7.cmp(textLen[0], 0) < 0)), curr, 0);
                    }
                    if (!ok) {
                    } else if (last != null) {
                        last.next = curr[0];
                    } else {
                        ps.put(ps__ai, curr[0]);
                    }
                    last = curr[0];
                    ok = ok && Read.Byte(in_, attrNum, 0);
                }
                ok = ok && (attrNum[0] == ReadStruct__ReadObject__ReadStdModel__ReadMeta__AttrEnd) && (metaSize == 1) && (rest == 0);
                return ok;
            }

            rest = o7.sub(rest, 10);
            txt[0] = null;
            ok = (rest > 0) && TextNew(txt, 0, types) && Read.Skip(in_, 6) && Read.LeUinteger(in_, metaSize, 0) && (o7.cmp(metaSize[0], rest) <= 0) && ReadMeta(in_, types, block, block__ai, txt[0].pieces, 0, metaSize[0], o7.sub(rest, metaSize[0])) && ReadPieces(in_, txt[0].pieces[0]);
            obj.put(obj__ai, txt[0]);
            return ok;
        }

        function ReadAny(in_, types, block, block__ai, begin, rest, obj, obj__ai) {
            var ok;
            var begin__prm = o7.array(1);
            var rest__prm = o7.array(1);

            function ReadItem(in_, types, block, block__ai, begin, begin__ai, rest, rest__ai, struct_, struct__ai) {
                var ok;
                var size = o7.array(1);

                struct_.put(struct__ai, new Struct());
                rest.inc(rest__ai, -(begin.at(begin__ai)));
                size[0] = 0;
                ok = (struct_.at(struct__ai) != null) && ((o7.cmp(begin.at(begin__ai), 0) == 0) || PieceNew(block, block__ai, begin.at(begin__ai), PieceChar1, struct_.at(struct__ai).data, 0) && ReadPieces(in_, struct_.at(struct__ai).data[0])) && ReadStruct(in_, types, block, block__ai, begin, begin__ai, size, 0, rest.at(rest__ai), struct_.at(struct__ai));
                rest.inc(rest__ai, -(size[0]));
                return ok;
            }

            rest__prm[0] = rest;
            begin__prm[0] = begin;
            ok = ObjNew(obj, obj__ai, types.currentDesc);
            if (!ok) {
            } else if (o7.cmp(begin__prm[0], 0) >= 0) {
                ok = ReadItem(in_, types, block, block__ai, begin__prm, 0, rest__prm, 0, obj.at(obj__ai).first, 0);
                obj.at(obj__ai).last = obj.at(obj__ai).first[0];
                while (ok && (o7.cmp(begin__prm[0], 0) >= 0)) {
                    ok = ReadItem(in_, types, block, block__ai, begin__prm, 0, rest__prm, 0, obj.at(obj__ai).last.next, 0);
                    obj.at(obj__ai).last = obj.at(obj__ai).last.next[0];
                }
                if (ok && (o7.cmp(rest__prm[0], 0) > 0)) {
                    ok = ReadData(in_, block, block__ai, rest__prm[0], obj.at(obj__ai).last.next, 0);
                    if (ok) {
                        obj.at(obj__ai).last = obj.at(obj__ai).last.next[0];
                        obj.at(obj__ai).last.next[0] = null;
                    }
                }
            } else {
                ok = ReadData(in_, block, block__ai, rest__prm[0], obj.at(obj__ai).first, 0);
                if (ok) {
                    obj.at(obj__ai).last = obj.at(obj__ai).first[0];
                    obj.at(obj__ai).last.next[0] = null;
                }
            }
            return ok;
        }

        ok = ReadPath(in_, types, pathSize, 0, rest) && (16 <= (o7.sub(rest, pathSize[0]))) && ReadMidNext(in_, next, next__ai) && Read.LeUinteger(in_, begin, 0) && ((o7.cmp(begin[0], 0) == 0) || (o7.cmp(begin[0], 4) >= 0)) && Read.LeUinteger(in_, content, 0) && ((o7.cmp(next.at(next__ai), 0) == 0) || (o7.cmp(next.at(next__ai), 8) >= 0) && (o7.cmp(content[0], o7.sub(next.at(next__ai), 8)) <= 0)) && (o7.cmp(content[0], o7.sub(begin[0], 4)) > 0) && (o7.cmp(content[0], o7.sub(o7.sub(rest, 16), pathSize[0])) <= 0);
        if (!ok) {
            size.put(size__ai, 0);
        } else {
            size.put(size__ai, o7.add(o7.add(pathSize[0], content[0]), 16));
            next.put(next__ai, o7.sub(o7.sub(next.at(next__ai), 8), content[0]));

            if (o7.cmp(types.currentDesc, types.textModelsStdModel[0]) == 0) {
                ok = ReadStdModel(in_, types, block, block__ai, content[0], obj, obj__ai);
            } else {
                ok = ReadAny(in_, types, block, block__ai, o7.sub(begin[0], 4), content[0], obj, obj__ai);
            }
        }
        return ok;
    }

    ok = (o7.cmp(types.structDeep, StructDeepMax) < 0) && (rest > 0) && Read.Byte(in_, id, 0);
    types.structDeep = o7.add(types.structDeep, 1);
    if (!ok) {
        size.put(size__ai, 0);
    } else {
        struct_.data[0] = null;
        struct_.object[0] = null;
        struct_.kind = o7.inited(id[0]);
        if (id[0] == Nil) {
            size.put(size__ai, 9);
            ok = (o7.cmp(rest, size.at(size__ai)) >= 0) && ReadNil(in_, next, next__ai);
        } else if ((id[0] == Link) || (id[0] == NewLink)) {
            size.put(size__ai, 13);
            ok = (o7.cmp(rest, size.at(size__ai)) >= 0) && ReadLink(in_, id[0] == NewLink, next, next__ai);
        } else if ((id[0] == Elem) || (id[0] == Store)) {
            ok = ReadObject(in_, types, block, block__ai, next, next__ai, size, size__ai, o7.sub(rest, 1), struct_.object, 0);
            size.inc(size__ai, 1);
        } else {
            size.put(size__ai, 1);
            ok = false;
        }
    }
    types.structDeep = o7.sub(types.structDeep, 1);
    return ok;
}

function ReadDoc(in_, doc, doc__ai) {
    var next = o7.array(1);
    var size = o7.array(1);
    var block = o7.array(1);

    doc.put(doc__ai, new Document());
    if (doc.at(doc__ai) != null) {
        TypesInit(doc.at(doc__ai).types);
        block[0] = null;
        if (!(ReadIntro(in_) && ReadStruct(in_, doc.at(doc__ai).types, block, 0, next, 0, size, 0, TypesLimits.IntegerMax, doc.at(doc__ai).struct_) && (o7.cmp(next[0], 0) < 0))) {
            doc.put(doc__ai, null);
        }
    }
    return doc.at(doc__ai) != null;
}
module.ReadDoc = ReadDoc;

function Code(char_) {
    var code;

    if ((0x0D == char_) || (0x0E == char_)) {
        code = 0x0A;
    } else if (((0xFF & 0x8B) > (0xFF & char_)) || ((0xFF & char_) > (0xFF & 0x91))) {
        code = char_;
    } else if (0x8B == char_) {
        code = CodeSpaceZeroWidth;
    } else if (0x8F == char_) {
        code = CodeFigureSpace;
    } else if (0x90 == char_) {
        code = CodeHyphen;
    } else if (0x91 == char_) {
        code = CodeNonBreakingHyphen;
    } else {
        code = char_;
    }
    return code;
}
module.Code = Code;

function IsNeedPrint(ctx) {
    return !(0 != ( (1 << SkipOberonComment) & ctx.opt.set[0])) || (o7.cmp(ctx.commentsDeep, 0) == 0);
}

function WritePiece(out, ctx, p) {
    var ofs;
    var size;
    var len = o7.array(1);
    var charSize;
    var code;
    var prev;
    var decDeep;
    var b;
    var ok;
    var skipComment;
    var isWindows1251;
    var utf8 = o7.array(4);

    charSize = o7.inited(p.kind);
    b = p.block;
    size = o7.inited(p.size);
    ofs = o7.inited(p.ofs);
    ok = true;
    prev = o7.inited(ctx.prevChar);
    skipComment = 0 != ( (1 << SkipOberonComment) & ctx.opt.set[0]);
    isWindows1251 = 0 != ( (1 << InputWindows1251) & ctx.opt.set[0]);
    do {
        if (charSize != 1) {
            code = o7.add(b.data.at(ofs), o7.mul(o7.mod(b.data.at(o7.add(ofs, 1)), 128), 256));
            if (code == 0x0D) {
                code = 0x0A;
            }
        } else {
            code = Code(b.data.at(ofs));
            if (isWindows1251 && (code == b.data.at(ofs))) {
                code = Windows1251.ToUnicode(code);
            }
        }

        size = o7.sub(size, charSize);
        ofs = o7.add(ofs, charSize);
        if (ofs == BlockSize - 32) {
            ofs = 0;
            b = b.next[0];
        }

        decDeep = 0;
        if (0x2A == code) {
            if (0x28 == prev) {
                ctx.commentsDeep = o7.add(ctx.commentsDeep, 1);
                prev =  - 1;
            } else {
                prev = code;
            }
        } else {
            if ((0x29 == code) && (0x2A == prev) && (o7.cmp(ctx.commentsDeep, 0) > 0)) {
                decDeep =  - 1;
            } else if ((o7.cmp(ctx.commentsDeep, 0) == 0) && (prev == 0x28) && (0 != ( (1 << SkipOberonComment) & ctx.opt.set[0]))) {
                ok = 1 == Stream.WriteChars(out, [40,0], 0, 1);
            }
            prev = code;
        }

        if (ok && (!skipComment || (o7.cmp(ctx.commentsDeep, 0) == 0) && (code != 0x28))) {
            len[0] = 0;
            if (code != 0x09) {
                o7.assert(Utf8.FromCode(utf8, len, 0, code));
                ok = o7.cmp(len[0], Stream.WriteChars(out, utf8, 0, len[0])) == 0;
            } else {
                ok = o7.cmp(ctx.opt.tabLen, Stream.WriteChars(out, ctx.opt.tab, 0, ctx.opt.tabLen)) == 0;
            }
        }
        ctx.commentsDeep = o7.add(ctx.commentsDeep, decDeep);
    } while (!(!ok || (size == 0)));
    ctx.prevChar = prev;
    return ok;
}

function WriteObject(out, ctx, types, obj) {
    var ok;
    var struct_;

    function WritePieces(out, ctx, ps, types) {
        var ok;

        ok = true;
        while ((ps != null) && ok) {
            if (ps.kind != PieceView) {
                ok = WritePiece(out, ctx, ps);
            } else if (ps.view[0] == null) {
                ok = !IsNeedPrint(ctx) || (1 == Stream.WriteChars(out, [32,0], 0, 1));
            } else if ((o7.cmp(ps.view[0].type, types.devCommandersStdView[0]) != 0) || (o7.cmp(ctx.opt.cmdLen, 0) == 0)) {
                ok = (0 != ( (1 << SkipEmbeddedView) & ctx.opt.set[0])) || WriteObject(out, ctx, types, ps.view[0]);
            } else {
                ok = !IsNeedPrint(ctx) || (o7.cmp(ctx.opt.cmdLen, Stream.WriteChars(out, ctx.opt.commanderReplacement, 0, ctx.opt.cmdLen)) == 0);
            }
            ps = ps.next;
        }
        return ok;
    }

    function WriteDesc(out, types, type) {
        var name;
        var l;

        name = o7.inited(types.desc.at(type).name[0]);
        l = Charz.CalcLen(types.names, name);
        return (1 == Stream.WriteChars(out, [60,0], 0, 1)) && (l == Stream.WriteChars(out, types.names, name, l)) && (1 == Stream.WriteChars(out, [62,0], 0, 1));
    }

    if (o7.cmp(obj.type, types.textModelsStdModel[0]) == 0) {
        ok = WritePieces(out, ctx, obj.pieces[0], types);
    } else {
        if (0 != ( (1 << WriteDescriptors) & ctx.opt.set[0])) {
            ok = WriteDesc(out, types, obj.type);
            ctx.prevChar = 0x3E;
        } else {
            ok = true;
        }
        struct_ = obj.first[0];
        while (ok && (struct_ != null)) {
            ok = (struct_.object[0] == null) || WriteObject(out, ctx, types, struct_.object[0]);
            struct_ = struct_.next[0];
        }
    }
    return ok;
}

function DefaultOptions(opt) {
    o7.strcpy(opt.commanderReplacement, [0]);
    o7.strcpy(opt.tab, [9,0]);
    opt.set[0] = 0;
}
module.DefaultOptions = DefaultOptions;

function PrintDoc(out, doc, opt) {
    var ctx = new PrintContext ();
    var ok;
    var ignore;

    o7.assert((o7.inited(opt.set[0]) & ~o7.set(0, LastOption)) == 0);

    ctx.opt.assign(opt);
    ctx.opt.cmdLen = Charz.CalcLen(opt.commanderReplacement, 0);
    ctx.opt.tabLen = Charz.CalcLen(opt.tab, 0);
    ctx.prevChar = 0x0A;
    ctx.commentsDeep = 0;
    ok = (doc.struct_.object[0] == null) || WriteObject(out, ctx, doc.types, doc.struct_.object[0]);
    if (ok && (o7.cmp(ctx.prevChar, 0x0A) != 0) && (0 != ( (1 << LastCharNewLine) & opt.set[0]))) {
        ignore = 1 == Stream.WriteChars(out, [10,0], 0, 1);
    }
    return ok;
}
module.PrintDoc = PrintDoc;

return module;
})();

/* Generated by Vostok - Oberon-07 translator */

/* Utility for copy from input to output
 * Copyright 2019 ComdivByZero
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
(function() { 'use strict';
var V = o7.import.V;
var Stream = o7.import.VDataStream;

var module = {};
o7.export.VCopy = module;

var BlockSize = 4096;

function UntilEnd(in_, out) {
    var buf = o7.array(BlockSize);
    var size;

    size = Stream.Read(in_, buf, 0, BlockSize);
    while ((size > 0) && (size == Stream.Write(out, buf, 0, size))) {
        size = Stream.Read(in_, buf, 0, BlockSize);
    }
}
module.UntilEnd = UntilEnd;

return module;
})();

/* Copyright 2022 ComdivByZero
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
(function() { 'use strict';

var module = {};
o7.export.OsEnv = module;

var getenv;

module.MaxLen = 4096;

function Exist(name) {
    return env[name] != undefined;
}
module.Exist = Exist;

function Get(val, ofs, ofs_i, name) {
    var ok, e, i, j;

    i = ofs.at(ofs_i);
    o7.assert((0 <= i) && (i < val.length - 1));

    e = getenv(o7.utf8ToStr(name));
    ok = e != undefined;
    if (ok) {
        e = o7.toUtf8(e);
        ok = e.length <= val.length - i;
        if (ok) {
            for (j = 0; j < e.length; j += 1) {
                val[i] = e[j];
                i += 1;
            }
        }
    }
    return ok;
}
module.Get = Get;


     if (typeof process !== 'undefined') { getenv = function(str) { return process.env[str]; } }
else if (typeof std     !== 'undefined') { getenv = std.getenv; }
else                                     { getenv = function(str) { return undefined; } }

return module;
})();

/* Copyright 2019,2021-2022 ComdivByZero
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
(function() { 'use strict';

var child_process, fs;

var module = {};
o7.export.OsExec = module;

var Ok = 0;
module.Ok = Ok;

if (typeof require !== 'undefined') {
	child_process = require("child_process");
	fs = require('fs');
} else {
	child_process = null;
	fs = null;
}

if (child_process != null) {
	module.Do = function(cmd) {
		var ret, out, errout;
		o7.assert((0xFF & cmd[0]) != 0x00);

		try {
			out = child_process.execSync(o7.utf8ToStr(cmd))
			errout = null;
			ret = Ok;
		} catch (err) {
			out = err.stdout;
			errout = err.stderr;
			ret = err.status;
		}
		if (fs != null) {
			if (out != null && out.length > 0) {
				fs.writeSync(process.stdout.fd, out);
			}
			if (errout != null && errout.length > 0) {
				fs.writeSync(process.stderr.fd, errout);
			}
		} else if (console != undefined) {
			if (out != null) {
				out = out.toString();
			} else {
				out = "";
			}
			if (errout != null) {
				out += errout.toString();
			}
			console.log(out);
		}
		return ret;
	}
} else if (typeof os !== 'undefined') {
	module.Do = function(cmd) {
		o7.assert((0xFF & cmd[0]) != 0x00);
		/* TODO */
		return os.exec(["bash", "-c", o7.utf8ToStr(cmd)]);
	}
} else {
	module.Do = function(cmd) { o7.assert((0xFF & cmd[0]) != 0x00); return -1; }
}

return module;
})();

/* Generated by Vostok - Oberon-07 translator */

(function() { 'use strict';
var log = o7.import.log;
var CLI = o7.import.CLI;
var Odc = o7.import.Odc;
var CFiles = o7.import.CFiles;
var Stream = o7.import.VDataStream;
var File = o7.import.VFileStream;
var Copy = o7.import.VCopy;
var VDefaultIO = o7.import.VDefaultIO;
var OsEnv = o7.import.OsEnv;
var OsExec = o7.import.OsExec;
var Charz = o7.import.Charz;
var Utf8 = o7.import.Utf8;
var Windows1251 = o7.import.OldCharsetWindows1251;
var Platform = o7.import.Platform;

var module = {};
o7.export.odcey = module;

var Version = [48,46,52,0];
module.Version = Version;

var McConfig = [46,99,111,110,102,105,103,47,109,99,47,109,99,46,101,120,116,46,105,110,105,0];
var McConfigBackup = [46,99,111,110,102,105,103,47,109,99,47,109,99,46,101,120,116,46,105,110,105,126,0];
var McConfigNew = [46,99,111,110,102,105,103,47,111,100,99,101,121,45,110,101,119,45,109,99,46,101,120,116,46,105,110,105,0];

var options = new Odc.Options ();

function Help(cli) {
    var commanderTo = o7.array(42);
    var skipEmbedded = o7.array(42);
    var skipComment = o7.array(42);
    var writeDescs = o7.array(42);
    var tab = o7.array(42);
    var windows1251 = o7.array(42);

    log.sn([111,100,99,101,121,32,45,32,99,111,110,118,101,114,116,101,114,32,111,102,32,46,111,100,99,32,102,111,114,109,97,116,32,116,111,32,112,108,97,105,110,32,116,101,120,116,0]);
    log.n();
    log.sn([85,115,97,103,101,58,0]);
    if (cli) {
        log.sn([32,48,46,32,111,100,99,101,121,32,32,116,101,120,116,32,32,91,105,110,112,117,116,32,91,111,117,116,112,117,116,93,93,32,123,32,111,112,116,105,111,110,115,32,125,0]);
        log.sn([32,32,32,32,111,100,99,101,121,32,91,116,101,120,116,93,32,32,105,110,112,117,116,32,91,111,117,116,112,117,116,93,32,32,123,32,111,112,116,105,111,110,115,32,125,0]);
        log.sn([32,49,46,32,111,100,99,101,121,32,32,103,105,116,32,32,32,91,100,105,114,93,0]);
        log.sn([32,50,46,32,111,100,99,101,121,32,32,109,99,0]);
        o7.strcpy(commanderTo, [45,99,111,109,109,97,110,100,101,114,45,116,111,32,60,115,116,114,62,0]);
        o7.strcpy(skipEmbedded, [45,115,107,105,112,45,101,109,98,101,100,100,101,100,45,118,105,101,119,0]);
        o7.strcpy(skipComment, [45,115,107,105,112,45,99,111,109,109,101,110,116,32,32,32,32,32,32,0]);
        o7.strcpy(writeDescs, [45,119,114,105,116,101,45,100,101,115,99,114,105,112,116,111,114,115,32,0]);
        o7.strcpy(windows1251, [45,105,110,112,117,116,45,119,105,110,100,111,119,115,49,50,53,49,32,0]);
        o7.strcpy(tab, [45,116,97,98,32,60,115,116,114,62,32,32,32,32,32,32,32,32,32,0]);
    } else {
        log.sn([32,48,46,32,111,100,99,101,121,46,116,101,120,116,40,105,110,112,117,116,44,32,111,117,116,112,117,116,41,0]);
        log.sn([32,49,46,32,111,100,99,101,121,46,97,100,100,84,111,71,105,116,40,100,105,114,41,0]);
        o7.strcpy(commanderTo, [111,100,99,101,121,46,99,111,109,109,97,110,100,101,114,84,111,40,115,116,114,41,32,32,32,32,32,32,32,32,32,32,32,32,0]);
        o7.strcpy(skipEmbedded, [111,100,99,101,121,46,111,112,116,40,123,79,100,99,46,83,107,105,112,69,109,98,101,100,100,101,100,86,105,101,119,32,125,41,0]);
        o7.strcpy(skipComment, [32,32,32,32,32,32,32,32,32,32,123,79,100,99,46,83,107,105,112,79,98,101,114,111,110,67,111,109,109,101,110,116,125,32,0]);
        o7.strcpy(writeDescs, [32,32,32,32,32,32,32,32,32,32,123,79,100,99,46,87,114,105,116,101,68,101,115,99,114,105,112,116,111,114,115,32,125,32,0]);
        o7.strcpy(windows1251, [32,32,32,32,32,32,32,32,32,32,123,79,100,99,46,73,110,112,117,116,87,105,110,100,111,119,115,49,50,53,49,32,125,32,0]);
        o7.strcpy(tab, [111,100,99,101,121,46,116,97,98,40,115,116,114,41,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,0]);
    }
    log.n();
    log.sn([48,46,32,80,114,105,110,116,32,116,101,120,116,32,99,111,110,116,101,110,116,32,111,102,32,46,111,100,99,44,32,101,109,112,116,121,32,97,114,103,117,109,101,110,116,115,32,102,111,114,32,115,116,97,110,100,97,114,100,32,73,79,0]);
    log.s([32,32,32,0]);
    log.s(commanderTo);
    log.sn([32,32,115,101,116,32,67,111,109,109,97,110,100,101,114,45,118,105,101,119,32,114,101,112,108,97,99,101,109,101,110,116,0]);
    log.s([32,32,32,0]);
    log.s(skipEmbedded);
    log.sn([32,32,115,107,105,112,115,32,101,109,98,101,100,100,101,100,32,118,105,101,119,115,32,119,114,105,116,105,110,103,0]);
    log.s([32,32,32,0]);
    log.s(skipComment);
    log.sn([32,32,115,107,105,112,115,32,40,42,32,79,98,101,114,111,110,32,99,111,109,109,101,110,116,115,32,42,41,32,0]);
    log.s([32,32,32,0]);
    log.s(writeDescs);
    log.sn([32,32,112,114,105,110,116,32,100,101,115,99,114,105,112,116,111,114,115,32,111,102,32,118,105,101,119,115,32,0]);
    log.s([32,32,32,0]);
    log.s(windows1251);
    log.sn([32,32,115,101,116,32,99,104,97,114,115,101,116,32,87,105,110,100,111,119,115,45,49,50,53,49,32,105,110,115,116,101,97,100,32,111,102,32,76,97,116,105,110,45,49,0]);
    log.s([32,32,32,0]);
    log.sn([32,32,40,117,115,101,102,117,108,32,102,111,114,32,108,101,103,97,99,121,32,67,121,114,105,108,108,105,99,32,66,108,97,99,107,66,111,120,32,98,117,105,108,100,115,41,0]);
    log.s([32,32,32,0]);
    log.s(tab);
    log.sn([32,32,115,101,116,32,116,97,98,117,108,97,116,105,111,110,32,114,101,112,108,97,99,101,109,101,110,116,0]);
    log.n();
    log.sn([49,46,32,69,109,98,101,100,32,116,111,32,97,32,46,103,105,116,32,114,101,112,111,32,97,115,32,97,32,116,101,120,116,32,99,111,110,118,101,114,116,101,114,59,32,101,109,112,116,121,32,97,114,103,117,109,101,110,116,32,102,111,114,32,99,117,114,114,101,110,116,32,100,105,114,0]);
    log.sn([50,46,32,67,111,110,102,105,103,117,114,101,32,118,105,101,119,101,114,32,111,102,32,109,105,100,110,105,103,104,116,32,99,111,109,109,97,110,100,101,114,0]);
}

function Text(input, output, opts) {
    var ok;
    var in_ = o7.array(1);
    var out = o7.array(1);
    var doc = o7.array(1);
    var opt = new Odc.Options ();

    if (o7.strcmp(input, [0]) != 0) {
        in_[0] = File.OpenIn(input);
    } else {
        in_[0] = VDefaultIO.OpenIn();
    }
    if (in_[0] == null) {
        log.sn([67,97,110,32,110,111,116,32,111,112,101,110,32,105,110,112,117,116,0]);
        ok = false;
    } else {
        ok = Odc.ReadDoc(in_[0], doc, 0);
        Stream.CloseIn(in_, 0);
        if (!ok) {
            log.sn([69,114,114,111,114,32,100,117,114,105,110,103,32,112,97,114,115,105,110,103,32,105,110,112,117,116,32,97,115,32,46,111,100,99,0]);
        } else {
            opt.assign(opts);
            if (o7.strcmp(output, [0]) == 0) {
                out[0] = VDefaultIO.OpenOut();
                opt.set.incl(0, Odc.LastCharNewLine);
            } else {
                out[0] = File.OpenOut(output);
            }
            ok = (out[0] != null) && Odc.PrintDoc(out[0], doc[0], opt);
            if (out[0] == null) {
                log.sn([67,97,110,32,110,111,116,32,111,112,101,110,32,111,117,116,112,117,116,0]);
            } else if (!ok) {
                log.sn([69,114,114,111,114,32,100,117,114,105,110,103,32,112,114,105,110,116,105,110,103,32,116,111,32,111,117,116,112,117,116,0]);
            }
            Stream.CloseOut(out, 0);
        }
    }
    return ok;
}

function ConcatPath(res, dir, file) {
    var len = o7.array(1);

    len[0] = 0;
    return ((o7.strcmp(dir, [0]) == 0) || Charz.CopyString(res, len, 0, dir) && Charz.PutChar(res, len, 0, 0x2F)) && Charz.CopyString(res, len, 0, file);
}

function Open(dir, file) {
    var path = o7.array(4096);
    var out;

    if (ConcatPath(path, dir, file)) {
        out = File.OpenForAppend(path);
    } else {
        out = null;
    }
    if (out == null) {
        log.s([67,97,110,32,110,111,116,32,111,112,101,110,32,39,0]);
        log.s(path);
        log.sn([39,0]);
    }
    return out;
}

function OpenIn(dir, file) {
    var path = o7.array(4096);
    var in_;

    if (ConcatPath(path, dir, file)) {
        in_ = File.OpenIn(path);
    } else {
        in_ = null;
    }
    if (in_ == null) {
        log.s([67,97,110,32,110,111,116,32,111,112,101,110,32,39,0]);
        log.s(path);
        log.sn([39,0]);
    }
    return in_;
}

function AddToGit(gitDir) {
    var ok;
    var attrs = o7.array(1);
    var config = o7.array(1);
    var str = o7.array(64);
    var len = o7.array(1);

    attrs[0] = Open(gitDir, [46,103,105,116,47,105,110,102,111,47,97,116,116,114,105,98,117,116,101,115,0]);
    config[0] = Open(gitDir, [46,103,105,116,47,99,111,110,102,105,103,0]);
    ok = (attrs[0] != null) && (config[0] != null);
    if (ok) {
        len[0] = 0;
        o7.assert(Charz.PutChar(str, len, 0, Utf8.NewLine) && Charz.CopyString(str, len, 0, [42,46,111,100,99,32,100,105,102,102,61,99,112,0]) && Charz.PutChar(str, len, 0, Utf8.NewLine));
        ok = o7.cmp(len[0], Stream.WriteChars(attrs[0], str, 0, len[0])) == 0;
        if (!ok) {
            log.sn([67,97,110,32,110,111,116,32,101,100,105,116,32,46,103,105,116,47,105,110,102,111,47,97,116,116,114,105,98,117,116,101,115,0]);
        } else {
            ok = (OsExec.Do([103,105,116,32,99,111,110,102,105,103,32,100,105,102,102,46,99,112,46,98,105,110,97,114,121,32,116,114,117,101,0]) == 0) && (OsExec.Do([103,105,116,32,99,111,110,102,105,103,32,100,105,102,102,46,99,112,46,116,101,120,116,99,111,110,118,32,39,111,100,99,101,121,32,116,101,120,116,32,45,119,114,105,116,101,45,100,101,115,99,114,105,112,116,111,114,115,32,60,39,0]) == 0);
            if (!ok) {
                log.sn([67,97,110,32,110,111,116,32,115,101,116,117,112,32,103,105,116,32,116,101,120,116,99,111,110,118,0]);
            }
        }
    }
    File.CloseOut(attrs, 0);
    File.CloseOut(config, 0);
    return ok;
}

function Rename(dir, name, newName) {
    var old = o7.array(4096);
    var new_ = o7.array(4096);

    return ConcatPath(old, dir, name) && ConcatPath(new_, dir, newName) && CFiles.Rename(old, 0, new_, 0);
}

function AddToMc() {
    var ok;
    var oldOk;
    var config = o7.array(1);
    var old = o7.array(1);
    var home = o7.array(256);
    var str = o7.array(256);
    var len = o7.array(1);

    len[0] = 0;
    ok = OsEnv.Get(home, len, 0, [72,79,77,69,0]);
    if (ok) {
        config[0] = Open(home, [46,99,111,110,102,105,103,47,111,100,99,101,121,45,110,101,119,45,109,99,46,101,120,116,46,105,110,105,0]);
        old[0] = OpenIn(home, [46,99,111,110,102,105,103,47,109,99,47,109,99,46,101,120,116,46,105,110,105,0]);
        oldOk = old[0] != null;
        ok = (config[0] != null);
        if (ok) {
            len[0] = 0;
            o7.assert(Charz.CopyString(str, len, 0, [35,111,100,99,32,66,108,97,99,107,66,111,120,32,67,111,109,112,111,110,101,110,116,32,66,117,105,108,100,101,114,32,99,111,110,116,97,105,110,101,114,32,100,111,99,117,109,101,110,116,0]) && Charz.PutChar(str, len, 0, Utf8.NewLine) && Charz.CopyString(str, len, 0, [91,111,100,99,93,0]) && Charz.PutChar(str, len, 0, Utf8.NewLine) && Charz.CopyString(str, len, 0, [83,104,101,108,108,61,46,111,100,99,0]) && Charz.PutChar(str, len, 0, Utf8.NewLine) && Charz.CopyString(str, len, 0, [86,105,101,119,61,37,118,105,101,119,123,97,115,99,105,105,125,32,111,100,99,101,121,32,116,101,120,116,32,37,102,0]) && Charz.PutChar(str, len, 0, Utf8.NewLine) && Charz.PutChar(str, len, 0, Utf8.NewLine));
            ok = (o7.cmp(len[0], Stream.WriteChars(config[0], str, 0, len[0])) == 0);
            if (ok && oldOk) {
                Copy.UntilEnd(old[0], config[0]);
            }
        }
        File.CloseIn(old, 0);
        File.CloseOut(config, 0);
        if (ok) {
            ok = (!oldOk || Rename(home, [46,99,111,110,102,105,103,47,109,99,47,109,99,46,101,120,116,46,105,110,105,0], [46,99,111,110,102,105,103,47,109,99,47,109,99,46,101,120,116,46,105,110,105,126,0])) && Rename(home, [46,99,111,110,102,105,103,47,111,100,99,101,121,45,110,101,119,45,109,99,46,101,120,116,46,105,110,105,0], [46,99,111,110,102,105,103,47,109,99,47,109,99,46,101,120,116,46,105,110,105,0]);
        }
    }
    return ok;
}

function help() {
    Help(false);
}
module.help = help;

function commanderTo(replacement) {
    o7.copy(options.commanderReplacement, replacement);
}
module.commanderTo = commanderTo;

function opt(set) {
    o7.assert((set & ~o7.set(0, Odc.LastOption)) == 0);
    options.set[0] = set;
}
module.opt = opt;

function tab(str) {
    o7.copy(options.tab, str);
}
module.tab = tab;

function text(input, output) {
    var ignore;

    ignore = Text(input, output, options);
}
module.text = text;

function addToGit(gitDir) {
    var ignore;

    ignore = AddToGit(gitDir);
}
module.addToGit = addToGit;

function addToMc() {
    if (!AddToMc()) {
        log.s([67,97,110,32,110,111,116,32,101,100,105,116,32,0]);
        log.sn([46,99,111,110,102,105,103,47,109,99,47,109,99,46,101,120,116,46,105,110,105,0]);
    }
}
module.addToMc = addToMc;

function Cli() {
    var args = o7.array(2, CLI.MaxLen + 1);
    var tabOpt = o7.array(16);
    var len = o7.array(1);
    var i = o7.array(1);
    var argInd;
    var ok = o7.array(1);

    function Option(ind, ind__ai, par, arg, ok, ok__ai) {
        var match;
        var buf = o7.array(16);
        var ofs = o7.array(1);

        ofs[0] = 0;
        match = (o7.cmp(ind.at(ind__ai), CLI.count) < 0) && CLI.Get(buf, ofs, 0, ind.at(ind__ai)) && (o7.strcmp(buf, par) == 0);
        if (match) {
            ind.inc(ind__ai, 1);
            ofs[0] = 0;
            ok.put(ok__ai, false);
            if (o7.cmp(ind.at(ind__ai), CLI.count) == 0) {
                log.s([65,98,115,101,110,116,32,97,114,103,117,109,101,110,116,32,102,111,114,32,112,97,114,97,109,101,116,101,114,32,39,0]);
                log.s(par);
                log.sn([39,0]);
            } else if (o7.strcmp(arg, [0]) != 0) {
                log.s([68,117,98,108,105,99,97,116,101,100,32,112,97,114,97,109,101,116,101,114,32,39,0]);
                log.s(par);
                log.sn([39,0]);
            } else if (!CLI.Get(arg, ofs, 0, ind.at(ind__ai))) {
                log.s([65,114,103,117,109,101,110,116,32,102,111,114,32,112,97,114,97,109,101,116,101,114,32,39,0]);
                log.s(par);
                log.sn([39,32,116,111,111,32,108,111,110,103,0]);
            } else {
                ind.inc(ind__ai, 1);
                ok.put(ok__ai, true);
            }
        }
        return match || !o7.inited(ok.at(ok__ai));
    }

    function BoolOption(ind, ind__ai, par, val, set, set__ai, ok, ok__ai) {
        var match;
        var buf = o7.array(24);
        var ofs = o7.array(1);

        ofs[0] = 0;
        match = (o7.cmp(ind.at(ind__ai), CLI.count) < 0) && CLI.Get(buf, ofs, 0, ind.at(ind__ai)) && (o7.strcmp(buf, par) == 0);
        if (!match) {
        } else if (o7.in(val, set.at(set__ai))) {
            log.s([68,117,98,108,105,99,97,116,101,100,32,112,97,114,97,109,101,116,101,114,32,39,0]);
            log.s(par);
            log.sn([39,0]);
            ok.put(ok__ai, false);
        } else {
            ind.inc(ind__ai, 1);
            set.incl(set__ai, val);
        }
        return match || !o7.inited(ok.at(ok__ai));
    }

    ok[0] = true;
    len[0] = 0;
    i[0] = 0;
    if ((CLI.count == 0) || !CLI.Get(args[0], len, 0, 0)) {
        ok[0] = false;
        Help(true);
    } else if (o7.strcmp(args[0], [104,101,108,112,0]) == 0) {
        Help(true);
    } else if (o7.strcmp(args[0], [118,101,114,115,105,111,110,0]) == 0) {
        log.sn([48,46,52,0]);
    } else if ((o7.strcmp(args[0], [116,101,120,116,0]) == 0) || (Charz.SearchChar(args[0], i, 0, 0x2E))) {
        i[0] = o7.bti(o7.strcmp(args[0], [116,101,120,116,0]) == 0);
        if (o7.cmp(i[0], 1) == 0) {
            o7.strcpy(args[0], [0]);
        }
        o7.strcpy(args[1], [0]);
        argInd = 0;
        o7.strcpy(tabOpt, [0]);
        while (o7.inited(ok[0]) && (o7.cmp(i[0], CLI.count) < 0)) {
            if (!Option(i, 0, [45,99,111,109,109,97,110,100,101,114,45,116,111,0], options.commanderReplacement, ok, 0) && !BoolOption(i, 0, [45,115,107,105,112,45,101,109,98,101,100,100,101,100,45,118,105,101,119,0], Odc.SkipEmbeddedView, options.set, 0, ok, 0) && !BoolOption(i, 0, [45,115,107,105,112,45,99,111,109,109,101,110,116,0], Odc.SkipOberonComment, options.set, 0, ok, 0) && !BoolOption(i, 0, [45,119,114,105,116,101,45,100,101,115,99,114,105,112,116,111,114,115,0], Odc.WriteDescriptors, options.set, 0, ok, 0) && !BoolOption(i, 0, [45,105,110,112,117,116,45,119,105,110,100,111,119,115,49,50,53,49,0], Odc.InputWindows1251, options.set, 0, ok, 0) && !Option(i, 0, [45,116,97,98,0], tabOpt, ok, 0) && (argInd < 2)) {
                len[0] = 0;
                o7.assert(CLI.Get(args.at(argInd), len, 0, i[0]));
                i.inc(0, 1);
                argInd = o7.add(argInd, 1);
            }
        }
        if (o7.strcmp(tabOpt, [0]) != 0) {
            o7.assert(Charz.Set(options.tab, tabOpt));
        }
        if (o7.inited(ok[0]) && (o7.cmp(i[0], CLI.count) < 0)) {
            ok[0] = false;
            log.sn([84,111,111,32,109,97,110,121,32,97,114,103,117,109,101,110,116,115,32,102,111,114,32,99,111,109,109,97,110,100,32,39,116,101,120,116,39,0]);
        }
        ok[0] = o7.inited(ok[0]) && Text(args[0], args[1], options);
    } else if (o7.strcmp(args[0], [103,105,116,0]) == 0) {
        if (CLI.count == 1) {
            ok[0] = AddToGit([0]);
        } else if (CLI.count == 2) {
            len[0] = 0;
            o7.assert(CLI.Get(args[0], len, 0, 1));
            len[0] = Charz.Trim(args[0], 0);
            ok[0] = AddToGit(args[0]);
        } else {
            ok[0] = false;
            log.sn([84,111,111,32,109,97,110,121,32,97,114,103,117,109,101,110,116,115,32,102,111,114,32,99,111,109,109,97,110,100,32,39,103,105,116,39,0]);
        }
    } else if (o7.strcmp(args[0], [109,99,0]) == 0) {
        ok[0] = AddToMc();
    } else {
        ok[0] = false;
        log.s([87,114,111,110,103,32,99,111,109,109,97,110,100,32,39,0]);
        log.s(args[0]);
        log.sn([39,0]);
    }
    CLI.SetExitCode(o7.sub(1, o7.bti(ok[0])));
}
module.Cli = Cli;

o7.main(function() {
    Odc.DefaultOptions(options);
    Cli();
});
return module;
})();

