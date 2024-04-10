/*
* Copyright (c) 2012, Interactive Advertising Bureau
* All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

*/

/**
 * @fileOverview This file contains the base library functionality need for both the publisher/host and vendor/client sides of the SafeFrames library.  Contains JavaScript language extensions and base level dom reading / manipulation
 * @author <a href="mailto:ssnider@yahoo-inc.com">Sean Snider</a>
 * @version 1.1.0
 */


/**
 * @namespace $sf  Defines the base $sf namespace.  This file should be the 1st file whenever including any SafeFrames js files
 *
 */

/*
 * Whenever you define a top level namespace, you need to put a "var" keyword statement in front of it.
 * This is b/c in Internet Explorer, elements with ID attributes can be treated as global variable. In turn
 * someone could have been dumb and have an element in the page named "$sf".
*/

if (window["$sf"]) {
  try {
    $sf.ver = "1-1-0";
    $sf.specVersion = "1.1";
  } catch (sf_lib_err) {

  }
} else {
  window["$sf"] = {
    ver: "1-1-0",
    specVersion: "1.1"
  };

};


/**
 * @namespace $sf.lib Defines the helper library functions and clases used througout the SafeFrames implementation
 * @name $sf.lib
 *
 */



/**
 * @namespace $sf.env Defines object / properties / functions that include information about the environment
 * @name $sf.env
 *
 */

/*
 * We always use a common pattern of enclosing our code within an anonymous function wrapper
 * such that we don't create any global variables (other than namespaces).
 *
*/

/** @ignore */
(function(win) {

  /*
   * Below we have some internal private variables. .
   * We always define variables at the top of any given function, using comma notation
   * if at all possible to reduce size.
   *
   * Often times here we have representations of values that are constants or constant strings.
   *
   * Note that we purposefully use escape / unescape functions rather than encodeURIComponent/decodeURIComponent
   * The reasons are that we want values that would not be ascii escaped by the newer function to get escaped,
   * and because escape / unescape are so legacy and ancient that they are actually very very fast.
   *
  */

  var q						= "?",
    a						= "&",
    eq						= "=",
    OBJ						= "object",
    FUNC					= "function",
    STR						= "string",
    NUM						= "number",
    RP						= "replace",
    LEN     				= "length",
    DOC						= "document",
    PROTO					= "prototype",
    N     					= (win && win.Number),
    M      					= (win && win.Math),
    d						= (win && win[DOC]),
    nav						= (win && win.navigator),
    ua						= (nav && nav.userAgent) || "",
    TLC						= "toLowerCase",
    GT						= "getAttribute",
    ST						= "setAttribute",
    RM						= "removeAttribute",
    GTE						= "getElementsByTagName",
    DCLDED					= "DOMContentLoaded",
    S						= (win && win.String),
    back_slash				= S.fromCharCode(92),
    two_slashes				= back_slash+back_slash,
    dbl_quote				= S.fromCharCode(34),
    esc_dbl_quote			= back_slash+dbl_quote,
    plus_char				= S.fromCharCode(43),
    scrip_str				= 'scr'+dbl_quote+plus_char+dbl_quote+'ipt',
    BLANK_URL				= "about:blank",
    NODE_TYPE				= "nodeType",
    IFRAME					= "iframe",
    GC						= "CollectGarbage",
    ie_attach				= "attachEvent",
    w3c_attach				= "addEventListener",
    ie_detach				= "detachEvent",
    w3c_detach				= "removeEventListener",
    use_attach				= "",
    use_detach				= "",
    use_ie_old_attach		= FALSE,
    IAB_LIB					= "$sf.lib",
    IAB_ENV					= "$sf.env",
    IAB_INF					= "$sf.info",
    IE_GC_INTERVAL			= 3000,
    TRUE					= true,
    FALSE					= false,
    NULL					= null,
    EVT_CNCL_METHODS		=
      {
        "preventDefault": 				0,
        "stopImmediatePropagation":		0,
        "stopPropagation":				0,
        "preventBubble":				0
      },

    NUM_MAX 					= (N && N.MAX_VALUE),
    NUM_MIN 					= (-1 * NUM_MAX),
    _es     					= (win && win.escape),
    _ue     					= (win && win.unescape),
    isIE11 						= !(window.ActiveXObject) && "ActiveXObject" in window,
    isIE						= !isIE11 && (win && ("ActiveXObject" in win)),
    next_id						= 0,
    useOldStyleAttrMethods		= FALSE,
    gc_timer_id					= 0,
    dom_is_ready				= NULL,
    dom_last_known_tag_count	= 0,
    dom_last_known_child_node	= NULL,
    dom_ready_chk_max_tries		= 300,
    dom_ready_chk_try_interval	= 50,
    dom_ready_chk_tries			= 0,
    dom_ready_chk_timer_id		= 0,
    iframe_next_id				= 0,
    iframe_cbs_attached			= {},
    evt_tgt_prop_a				= "",
    evt_tgt_prop_b				= "",
    iframe_msg_host_lib			= NULL,
    cached_ua					= NULL,


    /* private function variable references, we have lang set these private variables so that the dom lib below can access them quickly */

    _cstr, _cnum, _callable,
    lang, dom,

    /* public functions that are dynamically defined based on whether IE is being used */

    gc;



  /**
   * @namespace $sf.lib.lang Defines helper functions / objects for JavaScript common needs, such as type conversion and object serialization
   * @name $sf.lib.lang
   *
   */
  (function() {

    var proto;

    /**
     * A function reference that does nothing.
     *
     * @memberOf $sf.lib.lang
     * @exports noop as $sf.lib.lang.noop
     * @static
     * @function
     * @public
     * @return undefined
     *
     */
    function noop() {}


    /**
     * Forces type conversion of any JavaScript variable to a string value.
     * Note that "falsy" values or values that cannot be converted will be returned
     * as an empty string ("").
     *
     * @memberOf $sf.lib.lang
     * @exports cstr as $sf.lib.lang.cstr
     * @static
     * @public
     * @function
     * @param {*} str  Any object that needs to be converted to a string value.
     * @return {String}  The normalized string value.
     */

    function cstr(str)
    {
      var typ = typeof str;
      if (typ == STR) return str;
      if (typ == NUM && !str) return "0";
      if (typ == OBJ && str && str.join) return str.join("");
      if (str === false) return 'false';
      if (str === true) return 'true';
      return (str) ? S(str) : "";
    }

    /**
     * Forces type conversion of any JavaScript variable to a boolean.
     * "Falsy" values such as "", 0, null, and undefined all return false
     * String values of  "0", "false", "no", "undefined", "null" also return false
     *
     * @memberOf $sf.lib.lang
     * @exports cbool as $sf.lib.lang.cbool
     * @static
     * @public
     * @function
     * @param {*} val Any JavaScript reference / value
     * @return {Boolean} The normalized boolean value
     *
     */

    function cbool(val)
    {
      return (!val || val == "0" || val == "false" || val == "no" || val == "undefined" || val == "null") ? FALSE : TRUE;
    }


    /**
     * Forces type convertion of any JavaScript variable to a number.
     * Values / objects that cannot be converted, will be returned as NaN, unless
     * a default value is specified, in which case the default value is used.
     *
     * @memberOf $sf.lib.lang
     * @exports cnum as $sf.lib.lang.cnum
     * @static
     * @public
     * @function
     * @param {*} val Any JavaScript reference / value
     * @param {*} [defVal] use this value if original value cannot be converted to a number, or if value is less than min value, or if value is less than max value.
     * @param {Number} [minVal] specifies the lowest numerical value, if original value is less than this value, the defVal will be returned.
     * @param {Number} [maxVal] specifies the greatest numerical value, if original value is greater than this value, the defVal will be returned.
     * @return {Number|NaN|*} the converted value, otherwise NaN or default value
     *
     */

    function cnum(val, defVal, minVal, maxVal)
    {
      var e;

      if (typeof val != NUM)  {
        try {
          if (!val) {
            val = N.NaN;
          } else {
            val = parseFloat(val);
          }
        } catch (e) {
          val = N.NaN;
        }
      }

      if (maxVal == NULL)	{ maxVal = NUM_MAX; }
      if (minVal == NULL)	{ minVal = NUM_MIN; }

      return ((isNaN(val) || val < minVal || val > maxVal) && defVal != NULL) ? defVal : val;
    }

    /**
     * Checks that a function reference can be called safely.  Sometimes function references are part
     * of objects that may have been garbage collected (such as a function reference from another window or dom element).
     * This method checks the reference by making sure it has a constructor and toString properties.
     *
     * Note that this doesn't mean that the function itself when called (or its subsquent call stack), can't throw an error. . .
     * simply that you are able to call it. . .
     *
     * @memberOf $sf.lib.lang
     * @exports callable as $sf.lib.lang.callable
     * @static
     * @public
     * @function
     * @param {Function} A reference to a JavaScript function
     * @return {Boolean} true if function can be called safely, otherwise false.
     *
     */

    function callable(f)
    {
      var e;

      try {
        f = (f && typeof f == FUNC && f.toString() && (new f.constructor())) ? f : NULL;
      } catch (e) {
        f = NULL;
      }
      return !!(f);
    }

    /**
     * Generate a unique id string
     *
     * @memberOf $sf.lib.lang
     * @exports guid as $sf.lib.lang.guid
     * @static
     * @public
     * @function
     * @param {String} [prefix] a substring to use a prefix
     * @return {String} unique id string
     *
     */

    function guid(prefix)
    {
      return cstr([prefix||"","_",time(),"_",rand(),"_",next_id++]);
    }


    /**
     * Mixed the properties of one object into another object.
     * Note that this function is recursive
     *
     * @memberOf $sf.lib.lang
     * @exports mix as $sf.lib.lang.mix
     * @static
     * @public
     * @function
     * @param {Object}  r  The object that will receive properties
     * @param {Object}  s  The object that will deliever properties
     * @param {Boolean} [owned] Whether or not to skip over properties that are part of the object prototype
     * @param {Boolean} [skipFuncs] Whether or not to skip over function references
     * @param {Boolean} [no_ovr] Whether or not to overwrite properties that may have already been filled out
     * @return {Object} The receiver object passed in with potentially new properties added
     *
     */

    function mix(r, s, owned, skipFuncs,no_ovr)
    {
      var item, p,typ;

      if (!s || !r) return r;

      for (p in s)
      {
        item = s[p];
        typ  = typeof item;
        if (owned && !s.hasOwnProperty(p)) continue;
        if (no_ovr && (p in r)) continue;
        if (skipFuncs && typ == FUNC) continue;
        if (typ == OBJ && item) {
          if (item.slice) {
            item = mix([],item);
          } else {
            item = mix({},item);
          }
        }
        r[p] = item;
      }
      return r;
    }

    /**
     * Return the current time in milliseconds, from the epoch
     *
     * @memberOf $sf.lib.lang
     * @exports time as $sf.lib.lang.time
     * @public
     * @function
     * @static
     * @return {Number} current time
     *
     */

    function time() { return (new Date()).getTime(); }


    /**
     * Return a random integer anywhere from 0 to 99
     *
     * @memberOf $sf.lib.lang
     * @exports rand as $sf.lib.lang.rand
     * @public
     * @static
     * @function
     * @return {Number} random number
     *
     */

    function rand() { return M.round(M.random()*100); }


    /**
     * Trim the begining and ending whitespace from a string.
     * Note that this function will convert an argument to a string first
     * for type safety purposes. If string cannot be converted, and empty string is returned
     *
     * @memberOf $sf.lib.lang
     * @exports trim as $sf.lib.lang.trim
     * @return {String} trimmed string
     * @public
     * @function
     * @static
     *
     */

    function trim(str)
    {
      var ret = cstr(str);

      return (ret && ret[RP](/^\s\s*/, '')[RP](/\s\s*$/, ''));
    };

    /**
     * Define a JavaScript Namespace within a given context
     *
     * @memberOf $sf.lib.lang
     * @exports def as $sf.lib.lang.def
     * @param {String} str_ns  The name of the namespace in dot notation as a string (e.g. "Foo.bar")
     * @param {Object} [aug] defines the object at the end of the namespace.  If namespace is already specified, and this object is provided, the namespace will be augmented with properties from this object. If nothing is passed in, defaults to using an empty object.
     * @param {Object} [root] the root object from which the namespace is defined.  If not passed in defaults to the global/window object
     * @param {Boolean} [no_ovr] if true, properties already defined on root with the same name will be ignored
     * @public
     * @function
     * @static
     * @return {Object} The object at the end of the namespace
     *
     */

    function def(str_ns, aug, root,no_ovr)
    {
      var obj = (root && typeof root == OBJ) ? root : win,
        idx = 0,
        per = ".",
        ret = NULL,
        ar, item;

      if (str_ns) {
        str_ns 	= cstr(str_ns);
        aug 	= (aug && typeof aug == OBJ)  ? aug : NULL;
        if (str_ns.indexOf(per)) {
          ar = str_ns.split(per);
          while (item = ar[idx++])
          {
            item 		= trim(item);
            if (idx == ar[LEN]) {
              if (obj[item] && aug) {
                ret = obj[item] = mix(obj[item],aug,FALSE,NULL,no_ovr);
              } else {
                if (no_ovr && (item in obj)) {
                  ret = obj[item];
                } else {
                  ret = obj[item]	= obj[item] || aug || {};
                }
              }
            } else {
              if (no_ovr && (item in obj)) {
                ret = obj[item];
              } else {
                ret = obj[item]	= obj[item] || {};
              }
            }
            obj = obj[item];
          }
        } else {
          if (obj[str_ns] && aug) {
            ret = obj[str_ns] = mix(obj[str_ns], aug,FALSE,NULL,no_ovr);
          } else {
            ret = obj[str_ns] = obj[str_ns] || aug || {};
          }
        }
      }
      return ret;
    }

    /**
     * Checks for the existence of a JavaScript namespace
     * as opposed to def, which will automatically define the namespace
     * with a given context.
     *
     * @memberOf $sf.lib.lang
     * @exports ns as $sf.lib.lang.ns
     * @param {String} str_ns  A string with . or [] notation of a JavaScript namesace (e.g. "foo.bar.show", or "foo['bar']['show']").
     * @param {Object} [root] the root object to check within. .defaults to global / window
     * @return {*} The endpoint reference of the namespace or false if not found
     * @public
     * @function
     * @static
     *
     */

    function ns(str_ns, root)
    {
      var exp 	= /(\[(.{1,})\])|(\.\w+)/gm,
        exp2 	= /\[(('|")?)((\s|.)*?)(('|")?)\]/gm,
        exp3 	= /(\[.*)|(\..*)/g,
        exp4 	= /\./gm,
        idx 	= 0,
        rootStr	= "",
        exists	= TRUE,
        obj, matches, prop;


      obj = root = root || win;

      if (str_ns) {
        str_ns = cstr(str_ns);
        if (str_ns) {
          str_ns	= trim(str_ns);
          matches	= str_ns.match(exp);
          if (matches) {
            rootStr	= str_ns[RP](exp3, "");
            matches.unshift(rootStr);
            while (prop = matches[idx++])
            {
              prop = prop[RP](exp2, "$3")[RP](exp4, "");
              if (!obj[prop]) {
                exists = FALSE;
                break;
              }
              obj 	= obj[prop];
            }
          } else {
            prop = str_ns;
            obj	 = obj[prop];
          }
        } else {
          exists = FALSE;
        }
      } else {
        exists = FALSE;
      }
      return (exists && obj) || FALSE;
    }


    /**
     * @function
     * Tests to see if the object passed in is an array
     *
     */
    function isArray(obj){
      if(obj == null){
        return false;
      }
      if(typeof obj === "string"){
        return false;
      }
      if(obj.length != null && obj.constructor == Array){
        return true;
      }
      return false;
    }

    /**
     * Returns an escaped backslash for processing strings with HTML or JavaScript content
     *
     * @name $sf.lib.lang-_escaped_backslash
     * @function
     * @static
     * @private
     *
     */

    function _escaped_backslash() { return two_slashes; }

    /**
     * Returns an escaped double-quote for processing strings with HTML or JavaScript content
     *
     * @name $sf.lib.lang-_escaped_dbl_quote
     * @function
     * @static
     * @private
     *
     */

    function _escaped_dbl_quote() { return esc_dbl_quote; }

    /**
     * Returns an escaped return character for processing strings with HTML or JavaScript content
     *
     * @name $sf.lib.lang-_escaped_return
     * @function
     * @static
     * @private
     *
     */

    function _escaped_return()  { return "\\r"; }

    /**
     * Returns an escaped new line character for processing strings with HTML or JavaScript content
     *
     * @name $sf.lib.lang-_escaped_new_line
     * @function
     * @static
     * @private
     *
     */

    function _escaped_new_line()  { return "\\n"; }


    /**
     * Returns a seperated SCRIPT tag ("<script>" becomes "<scr"+"ipt>") for processing strings with HTML or JavaScript content
     * Assumes a regular expression of: /<(\/)*script([^>]*)>/gi
     *
     * @name $sf.lib.lang-_escaped_new_line
     * @function
     * @static
     * @private

     *
     */

    function _safe_script_tag(main_match, back_slash, attrs)	  { return cstr(["<",back_slash,scrip_str,attrs,">"]); }

    /**
     * Given a string of HTML escape quote marks and seperate script tags so that browsers don't get tripped up
     * during processing.
     *
     * @memberOf $sf.lib.lang
     * @exports jssafe_html as $sf.lib.lang.jssafe_html
     * @param {String} str A string of HTML markup to be processed
     * @return {String}
     * @function
     * @static
     * @public
     *
     */

    function jssafe_html(str)
    {
      var new_str	= cstr(str);
      if (new_str) {
        new_str = new_str.replace(/(<noscript[^>]*>)(\s*?|.*?)(<\/noscript>)/gim, "");
        new_str	= new_str.replace(/\\/g, _escaped_backslash);
        new_str	= new_str.replace(/\"/g, _escaped_dbl_quote);
        new_str = new_str.replace(/\n/g, _escaped_new_line);
        new_str	= new_str.replace(/\r/g, _escaped_return);
        new_str	= new_str.replace(/<(\/)*script([^>]*)>/gi, _safe_script_tag);
        new_str	= new_str.replace(/\t/gi, ' ' );
        new_str	= cstr([dbl_quote,new_str,dbl_quote]);
        new_str	= dbl_quote + new_str + dbl_quote;
      }
      return new_str;
    }


    /**
     * @class Intantiable class used to convert a delimited string into an object.<br />
     * For example querystrings: "name_1=value_1&name_2=value_2" ==> {name_1:value_1,name_2:value_2};<br/><br />
     *
     * Note that property values could also contain the same sPropDelim and sValueDelim strings.  Proper string encoding should occur
     * to not trip up the parsing of the string.  Said values may be ascii escaped, and in turn, along with the <i><b>bRecurse</b></i> constructor parameter set to true, will cause nested ParamHash objects to be created.
     *
     * @constructor
     * @memberOf $sf.lib.lang
     * @exports ParamHash as $sf.lib.lang.ParamHash
     * @param {String} [sString]  The delimited string to be converted
     * @param {String} [sPropDelim="&"]  The substring delimiter used to seperate properties. Default is "&".
     * @param {String} [sValueDelim="="]  The substring delimited used to seperate values.  Default is "=".
     * @param {Boolean} [bNoOverwrite=false]  If true, when a name is encountered more than 1 time in the string it will be ignored.
     * @param {Boolean} [bRecurse=false]  If true, when a value of a property that is parsed also has both the sPropDelim and sValueDelim inside, convert that value to another ParamHash object automatically
     * @example
     * var ph = new $sf.lib.lang.ParamHash("x=1&y=1&z=1");
     * alert(ph.x); // == 1
     * alert(ph.y); // == 1
     * alert(ph.z); // == 1
     *
     * @example
     * var ph = new $sf.lib.lang.ParamHash("x:1;y:2;z:3", ";", ":");
     * alert(ph.x); // == 1
     * alert(ph.y); // == 2
     * alert(ph.z); // == 3
     *
     * @example
     * var ph = new $sf.lib.lang.ParamHash("x=1&y=1&z=1&z=2");
     * alert(ph.x); // == 1
     * alert(ph.y); // 1
     * alert(ph.z); //Note that z == 2 b/c of 2 properties with the same name
     *
     * @example
     * var ph = new $sf.lib.lang.ParamHash("x=1&y=1&z=1&z=2",null,null,true); //null for sPropDelim and sValueDelim == use default values of "&" and "=" respectively
     * alert(ph.x); // == 1
     * alert(ph.y); // 1
     * alert(ph.z); //Note that z == 1 b/c bNoOverwrite was set to true
     *
     * @example
     * //You can also do recursive processing if need be
     * var points	= new $sf.lib.lang.ParamHash(),
     *     point_1	= new $sf.lib.lang.ParamHash(),
     *     point_2	= new $sf.lib.lang.ParamHash();
     *
     * point_1.x = 100;
     * point_1.y = 75;
     *
     * point_2.x = 200;
     * point_2.y = 150;
     *
     * points.point_1	= point_1;
     * points.point_2	= point_2;
     *
     * var point_str	= points.toString();  // == "point_1=x%3D100%26y%3D75%26&point_2=x%3D200%26y%3D150%26&";
     * var points_copy	= new $sf.lib.lang.ParamHash(point_str, null, null, true, true); //note passing true, b/c we want to recurse
     *
     * alert(points_copy.point_1.x) // == "100";
     *
     *
     */
    function ParamHash(sString, sPropDelim, sValueDelim, bNoOverwrite, bRecurse)
    {
      var idx, idx2, idx3, sTemp, sTemp2, sTemp3, me = this, pairs, nv, nm, added, cnt, io="indexOf",ss="substring", doAdd = FALSE, obj, len, len2;

      if (!(me instanceof ParamHash)) return new ParamHash(sString, sPropDelim, sValueDelim, bNoOverwrite,bRecurse);
      if (!arguments[LEN]) return me;

      if (sString && typeof sString == OBJ) return mix(new ParamHash("",sPropDelim,sValueDelim,bNoOverwrite,bRecurse),sString);

      sString 	= cstr(sString);
      sPropDelim	= cstr(sPropDelim) || a;
      sValueDelim	= cstr(sValueDelim) || eq;

      if (!sString) return me;
      if (sPropDelim != q && sValueDelim != q && sString.charAt(0) == q) sString = sString[ss](1);

      idx  = sString[io](q);
      idx2 = sString[io](sValueDelim);

      if (idx != -1 && idx2 != -1 && idx > idx2) {
        sTemp	= _es(sString[ss](idx2+1));
        sTemp2	= sString.substr(0, idx2+1);
        sString	= sTemp2 + sTemp;
      } else if (idx != -1) {
        sString	= sString[ss](idx+1);
        return new ParamHash(sString, sPropDelim, sValueDelim, bNoOverwrite);
      };
      if (sString.charAt(0) == sPropDelim) sString = sString[ss](1);

      pairs = sString.split(sPropDelim);
      cnt   = pairs[LEN];
      idx   = 0;
      while (cnt--)
      {
        sTemp	= pairs[idx++];
        added	= FALSE;
        doAdd	= FALSE;
        if (sTemp) {
          nv	= sTemp.split(sValueDelim);
          len	= nv[LEN];
          if (len > 2) {
            nm		= _ue(nv[0]);
            nv.shift();

            if (bRecurse) {
              /* Its possible that someone screws up and doesn't have a value encoded properly and but have multiple delimiters
               * As if recursion was going to take place. So here we know that's the case and try to handle it if we can detect
               * the end points as well
              */

              sTemp2	= nm+sValueDelim;
              idx2	= sString[io](sTemp2);
              len		= sTemp2[LEN];
              sTemp3	= sString[ss](idx2+len);
              sTemp2	= sPropDelim+sPropDelim;
              len2	= sTemp2[LEN];
              idx3	= sTemp3[io](sTemp2);
              if (idx3 != -1) {
                sTemp3 = sString.substr(idx2+len, idx3+len2);
                obj	   = new ParamHash(sTemp3, sPropDelim, sValueDelim, bNoOverwrite, bRecurse);
                sTemp3 = "";
                len	   = 0;
                for (sTemp3 in obj) len++;

                if (len > 0) idx += (len-1);
                sTemp = obj;
              } else {
                sTemp  = _ue(nv.join(sValueDelim));
              }

            } else {
              sTemp	= _ue(nv.join(sValueDelim));
            }
            doAdd	= TRUE;
          } else if (len == 2) {
            nm		= _ue(nv[0]);
            sTemp	= _ue(nv[1]);
            doAdd	= TRUE;
          }
          if (doAdd) {
            if (bNoOverwrite) {
              if (!(nm in me)) {
                me[nm] = sTemp
                added	 = TRUE;
              };
            } else {
              me[nm]	= sTemp;
              added		= TRUE;
            };
            if (bRecurse && added && nm && sTemp && typeof sTemp != OBJ && (sTemp[io](sPropDelim) >= 0 || sTemp[io](sValueDelim) >= 0)) {
              me[nm] = new ParamHash(sTemp, sPropDelim, sValueDelim, bNoOverwrite, bRecurse);
            }
          }
        }
      };
    }

    proto = ParamHash[PROTO];

    /*
     * This internal function is used for the valueOf / toString methods of our ParamHash class.
     *
    */

    /**
     * Converts a ParamHash object back into a string using the property and value delimiters specifed (defaults to "&" and "=").
     * Again this method works recursively.  If an object is found as a property, it will convert that object into a ParamHash string
     * and then escape it. Note also that this class's valueOf method is equal to this method.
     *
     * @methodOf ParamHash#
     * @public
     * @function
     * @param {String} [sPropDelim="&"]  The substring delimiter used to seperate properties. Default is "&".
     * @param {String} [sValueDelim="="]  The substring delimited used to seperate values.  Default is "=".
     * @param {Boolean} [escapeProp=false] Whether or not to ascii escape the name of a property
     * @param {Boolean} [dontEscapeValue=false] Do not escape values or properties automatically
     * @return {String} the encoded string representation of the object.
     *
     */
    function toString(sPropDelim, sValueDelim, escapeProp, dontEscapeValue)
    {
      var prop, buffer = [], me = this, itemType, item;

      sPropDelim 	= sPropDelim || a;
      sValueDelim	= sValueDelim || eq;

      for (prop in me)
      {
        item		= me[prop];
        itemType	= typeof item;

        if (item && itemType == FUNC) continue;
        if (item && itemType == OBJ) {
          item = toString.apply(item, [sPropDelim,sValueDelim,escapeProp,dontEscapeValue]);
        }
        if (escapeProp) prop = _es(prop);
        if (!dontEscapeValue) item = _es(item);

        buffer.push(prop, sValueDelim, item, sPropDelim);
      }
      return cstr(buffer);
    }


    /** @ignore */
    proto.toString = proto.valueOf = toString;

    lang = def(IAB_LIB + ".lang",
      {
        ParamHash:		ParamHash,
        cstr:			cstr,
        cnum:			cnum,
        cbool:			cbool,
        noop:			noop,
        trim:			trim,
        callable:		callable,
        guid:			guid,
        mix:			mix,
        time:			time,
        rand:			rand,
        def:			def,
        ns:				ns,
        jssafe_html: 	jssafe_html,
        isArray:		isArray
      });


    /**
     * Whether or not we are running within an Internet Explorer browser environment
     *
     * @name $sf.env.isIE
     * @type {Boolean}
     * @static
     * @public
     *
     */

    def("$sf.env", 		{isIE:isIE});

    _cstr 		= cstr;
    _cnum 		= cnum;
    _callable	= callable;

  })();

  /**
   * @namespace $sf.env.ua  Stores browser / user-agent information
   * @name $sf.env.ua
   * @requires $sf.lib.lang
   *
   */

  (function() {

    /**
     * Convert a version string into a numeric value
     *
     * @name $sf.env.ua-_numberify
     * @static
     * @private
     * @function
     * @param {String} s The string representing a version number (e.g. 'major.minor.revision')
     * @returns {Number}
     *
     */

    function _numberify(s)
    {
      var c = 0;

      return parseFloat(s.replace(/\./g, function()
      {
        return (c++ == 1) ? "" : ".";
      }));
    }

    /**
     * Wrapper method for returning values from a regular expression match safely.
     *
     * @name $sf.env.ua-_matchIt
     * @static
     * @private
     * @function
     * @param {String} str The string to match against
     * @param {RegExp} regEx The regular expression to use for matching
     * @param {Number} [idx] The index number of a match to pull from
     * @returns {String}
     *
     */

    function _matchIt(str, regEx, idx)
    {
      var m = str && str.match(regEx);

      return (idx == NULL) ? m : ((m && m[idx]) || NULL);
    }

    /**
     * Wrapper method for testing a string against a regular expression
     *
     * @name $sf.env.ua-_testIt
     * @static
     * @private
     * @function
     * @param {RegExp} regEx The regular expression to test with
     * @param {String} str The string to test against
     * @param {Boolean}
     *
     */

    function _testIt(regEx,str)
    {
      return regEx.test(str);
    }


    /**
     * Parse a user-agent string from the browser and gather pertinent browser, and OS information
     *
     * @name $sf.env.ua.parse
     * @static
     * @public
     * @function
     * @param {String} [subUA] An alternate user-agent string to parse. If no valid string is passed in, function will return an object based on the known user-agent
     * @returns {Object} <b>parsed</b> Browser and OS information<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
     * @returns {Number} <b>parsed</b>.ie  The major version number of the Internet Explorer browser being used, or 0 if not.<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
     * @returns {Number} <b>parsed</b>.opera The major version number of the Opera browser being used, or 0 if not.<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
     * @returns {Number} <b>parsed</b>.gecko The major version number of the Gecko (Firefox) browser being used, or 0 if not.<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
     * @returns {Number} <b>parsed</b>.webkit The major version number of the WebKit browser being used, or 0 if not.<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
     * @returns {Number} <b>parsed</b>.safari The major version number of the Safari browser being used, or 0 if not.<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
     * @returns {Number} <b>parsed</b>.chrome The major version number of the Chrome browser being used, or 0 if not.<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
     * @returns {Number} <b>parsed</b>.air The major version number of the AIR SDK being used, or 0 if not.<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
     * @returns {Number} <b>parsed</b>.ipod Whether or not an iPod device is being used 1 for true, 0 for false.<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
     * @returns {Number} <b>parsed</b>.ipad Whether or not an iPad device is being used 1 for true, 0 for false.<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
     * @returns {Number} <b>parsed</b>.iphone Whether or not an iPhone device is being used 1 for true, 0 for false.<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
     * @returns {Number} <b>parsed</b>.android The major version number of the Android OS being used, or 0 if not.<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
     * @returns {Number} <b>parsed</b>.webos The major version number of the WebOS being used, or 0 if not.<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
     * @returns {Number} <b>parsed</b>.silk The major version number of the Silk browser being used, or 0 if not.<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
     * @returns {Number} <b>parsed</b>.nodejs The major version number of the NodeJS environment being used, or 0 if not.<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
     * @returns {Number} <b>parsed</b>.phantomjs The major version number of the PhantomJS environment being used, or 0 if not.<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
     * @returns {String} <b>parsed</b>.mobile A string representing whether or not the browser / os is a mobile device  and it's type. Possible values are 'windows', 'android', 'symbos', 'linux', 'macintosh', 'rhino', 'gecko', 'Apple', 'chrome'.<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
     * @returns {Number} <b>parsed</b>.ios The major version number of the iOS being used, or 0 if not.<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
     * @returns {Boolean} <b>parsed</b>.accel Whether or not the browser / environment in question is hardware accelerated.<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
     * @returns {Number} <b>parsed</b>.cajaVersion The major version number of the CAJA environment or 0 if not.
     *
     */

    function parse_ua(subUA)
    {
      var ret = {}, match, date = new Date();

      if (!subUA && cached_ua) return cached_ua;

      ret.ie		 =
        ret.opera	 =
          ret.gecko 	 =
            ret.webkit	 =
              ret.safari	 =
                ret.chrome	 =
                  ret.air		 =
                    ret.ipod	 =
                      ret.ipad	 =
                        ret.iphone	 =
                          ret.android  =
                            ret.webos	 =
                              ret.silk 	 =
                                ret.nodejs	 =
                                  ret.phantomjs = 0;

      ret.mobile	=
        ret.ios		=
          ret.os		= NULL;
      ret.accel 	= false;

      ret.caja	= nav && nav.cajaVersion;
      ret.cks		= FALSE;
      subUA		= subUA || ua || "";

      if (subUA) {
        if (_testIt(/windows|win32/i,subUA)) {
          ret.os = 'windows';
        } else if (_testIt(/macintosh|mac_powerpc/i,subUA)) {
          ret.os = 'macintosh';
        } else if (_testIt(/android/i,subUA)) {
          ret.os = 'android';
        } else if (_testIt(/symbos/i, subUA)) {
          ret.os = 'symbos'
        } else if (_testIt(/linux/i, subUA)) {
          ret.os = 'linux';
        } else if (_testIt(/rhino/i,subUA)) {
          ret.os = 'rhino';
        }

        // Modern KHTML browsers should qualify as Safari X-Grade
        if (_testIt(/KHTML/,subUA)) {
          ret.webkit = 1;
        }

        if (_testIt(/IEMobile|XBLWP7/, subUA)) {
          ret.mobile = 'windows';
        }
        if (_testIt(/Fennec/, subUA)) {
          ret.mobile = 'gecko';
        }

        // Modern WebKit browsers are at least X-Grade
        match = _matchIt(subUA, /AppleWebKit\/([^\s]*)/, 1);
        if (match) {
          ret.webkit = _numberify(match);
          ret.safari = ret.webkit;

          if (_testIt(/PhantomJS/, subUA)) {
            match = _matchIt(subUA, /PhantomJS\/([^\s]*)/, 1);
            if (match) {
              ret.phantomjs = _numberify(match);
            }
          }

          // Mobile browser check
          if (_testIt(/ Mobile\//,subUA) || _testIt(/iPad|iPod|iPhone/, subUA)) {
            ret.mobile = 'Apple'; // iPhone or iPod Touch

            match 		= _matchIt(subUA, /OS ([^\s]*)/, 1);
            match 		= match && _numberify(match.replace('_', '.'));
            ret.ios 	= match;
            ret.ipad 	= ret.ipod = ret.iphone = 0;

            match 		= _matchIt(subUA,/iPad|iPod|iPhone/,0);
            if (match) {
              ret[match[TLC]()] = ret.ios;
            }

          } else {
            match	= _matchIt(subUA, /NokiaN[^\/]*|Android \d\.\d|webOS\/\d\.\d/, 0);
            if (match) {
              // Nokia N-series, Android, webOS, ex: NokiaN95
              ret.mobile = match;
            }
            if (_testIt(/webOS/,subUA)) {
              ret.mobile 	= 'WebOS';
              match 		= _matchIt(subUA, /webOS\/([^\s]*);/, 1);
              if (match) {
                ret.webos = _numberify(match);
              }
            }
            if (_testIt(/ Android/,subUA)) {
              ret.mobile 	= 'Android';
              match 		= _matchIt(subUA, /Android ([^\s]*);/, 1);
              if (match) {
                ret.android = _numberify(match);
              }
            }

            if (_testIt(/Silk/, subUA)) {
              match = _matchIt(subUA, /Silk\/([^\s]*)\)/, 1);
              if (match) {
                ret.silk = _numberify(match);
              }
              if (!ret.android) {
                ret.android = 2.34; //Hack for desktop mode in Kindle
                ret.os = 'Android';
              }
              if (_testIt(/Accelerated=true/, subUA)) {
                ret.accel = true;
              }
            }
          }

          match = subUA.match(/(Chrome|CrMo)\/([^\s]*)/);
          if (match && match[1] && match[2]) {
            ret.chrome = _numberify(match[2]); // Chrome
            ret.safari = 0; //Reset safari back to 0
            if (match[1] === 'CrMo') {
              ret.mobile = 'chrome';
            }
          } else {
            match = _matchIt(subUA,/AdobeAIR\/([^\s]*)/);
            if (match) {
              ret.air = match[0]; // Adobe AIR 1.0 or better
            }
          }

        }

        if (!ret.webkit) {
          match = _matchIt(subUA, /Opera[\s\/]([^\s]*)/, 1);
          if (match) {
            ret.opera	= _numberify(match);
            match		= _matchIt(subUA, /Opera Mini[^;]*/, 0);
            if (match) {
              ret.mobile = match; // ex: Opera Mini/2.0.4509/1316
            }
          } else { // not opera or webkit
            match = _matchIt(subUA, /MSIE\s([^;]*)/, 1);
            if (match) {
              ret.ie = _numberify(match);
            } else { // not opera, webkit, or ie
              match = _matchIt(subUA, /Gecko\/([^\s]*)/);

              if (match) {
                ret.gecko = 1; // Gecko detected, look for revision

                match	= _matchIt(subUA, /rv:([^\s\)]*)/, 1);
                if (match) {
                  ret.gecko = _numberify(match);
                }
              }
            }
          }
        }
      }

      try {
        date.setTime(date.getTime() + 1000);
        d.cookie = cstr(["sf_ck_tst=test; expires=", date.toGMTString(), "; path=/"]);
        if (d.cookie.indexOf("sf_ck_tst") != -1) ret.cks = TRUE;
      } catch (e) {
        ret.cks = FALSE;
      }

      try {
        if (typeof process == OBJ) {

          if (process.versions && process.versions.node) {
            //NodeJS
            ret.os = process.platform;
            ret.nodejs = numberify(process.versions.node);
          }
        }
      } catch (e) {
        ret.nodejs = 0;
      }

      return ret;
    }

    /**
     * The major version number of the Internet Explorer browser being used, or 0 if not.
     *
     * @name $sf.env.ua.ie
     * @type {Number}
     * @public
     * @static
     *
     */

    /**
     * The major version number of the Opera browser being used, or 0 if not.<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
     * @name $sf.env.ua.opera
     * @type {Number}
     * @public
     * @static
     */

    /**
     * The major version number of the Gecko (Firefox) browser being used, or 0 if not.
     * @name $sf.env.ua.gecko
     * @type {Number}
     * @public
     * @static
     */

    /**
     * The major version number of the WebKit browser being used, or 0 if not.
     * @name $sf.env.ua.webkit
     * @type {Number}
     * @public
     * @static
     */

    /**
     * The major version number of the Safari browser being used, or 0 if not.
     * @name $sf.env.ua.safari
     * @type {Number}
     * @public
     * @static
     */

    /**
     * The major version number of the Chrome browser being used, or 0 if not.
     * @name $sf.env.ua.chrome
     * @type {Number}
     * @public
     * @static
     */

    /**
     * The major version number of the AIR SDK being used, or 0 if not.
     * @name $sf.env.ua.air
     * @type {Number}
     * @public
     * @static
     */

    /**
     * Whether or not an iPod device is being used, 0 for false, &gt; 0 == true
     * @name $sf.env.ua.ipod
     * @type {Number}
     * @public
     * @static
     *
     */

    /**
     * Whether or not an iPad device is being used, 0 for false, &gt; 0 == true
     * @name $sf.env.ua.ipad
     * @type {Number}
     * @public
     * @static
     *
     */

    /**
     * Whether or not an iPhone device is being used, 0 for false, &gt; 0 == true
     * @name $sf.env.ua.iphone
     * @type {Number}
     * @public
     * @static
     *
     */

    /**
     * The major version number of the Android OS being used, or 0 if not.
     * @name $sf.env.ua.android
     * @type {Number}
     * @public
     * @static
     */

    /**
     * The major version number of the WebOS being used, or 0 if not.
     * @name $sf.env.ua.webos
     * @type {Number}
     * @public
     * @static
     */

    /**
     * The major version number of the Silk browser being used, or 0 if not.
     * @name $sf.env.ua.silk
     * @type {Number}
     * @public
     * @static
     */

    /**
     * The major version number of the NodeJS environment being used, or 0 if not.
     * @name $sf.env.ua.nodejs
     * @type {Number}
     * @public
     * @static
     */


    /**
     * The major version number of the PhantomJS environment being used, or 0 if not.
     * @name $sf.env.ua.phantomjs
     * @type {Number}
     * @public
     * @static
     */

    /**
     * A string representing whether or not the browser / os is a mobile device  and it's type. Possible values are 'windows', 'android', 'symbos', 'linux', 'macintosh', 'rhino', 'gecko', 'Apple', 'chrome'.
     *
     * @name $sf.env.ua.mobile
     * @type {String}
     * @public
     * @static
     */

    /**
     * The major version number of the iOS being used, or 0 if not.
     * @name $sf.env.ua.ios
     * @type {Number}
     * @public
     * @static
     */

    /**
     * Whether or not the browser / environment in question is hardware accelerated.
     * @name $sf.env.ua.accel
     * @type {Boolean}
     * @public
     * @static
     */

    /**
     * The major version number of the CAJA environment or 0 if not
     * @name $sf.env.ua.cajaVersion
     * @type {Number}
     * @public
     * @static
     */

    cached_ua			= parse_ua();
    cached_ua.parse		= parse_ua;
    lang.def(IAB_ENV + ".ua", cached_ua, NULL, TRUE);


  })();


  /**
   * @namespace $sf.lib.dom Defines helper functions / objects for common browser web-page / DOM interactions
   * @name $sf.lib.dom
   * @requires $sf.lib.lang
   *
   */

  (function() {

    /**
     * Clear out the timer function used as a fallback when ready state of the DOM
     * cannot be directly detected
     *
     * @name $sf.lib.dom-_clear_ready_timer_check
     * @private
     * @static
     * @function
     *
     */

    function _clear_ready_timer_check()
    {
      if (dom_ready_chk_timer_id) {
        clearTimeout(dom_ready_chk_timer_id);
        dom_ready_chk_timer_id = 0;
      }
    }


    function _handle_dom_load_evt(evt)
    {
      detach(win, "load", _handle_dom_load_evt);
      detach(win, DCLDED, _handle_dom_load_evt);
      dom_is_ready = TRUE;
    }

    /**
     * Checks to see if the DOM is ready to be manipulated, without the need for event hooking.
     * Often times you'll see folks use the onload event or DOMContentLoaded event.  However
     * the problem with those, is that your JavaScript code may have been loaded asynchronously,
     * after either one of those events have fired, and in which case you still don't know if the DOM is really
     * ready.  Most modern browsers (including IE), implement a document.readyState property that we can
     * check, but not all.  In the case where this property is not implemented, we do a series of node
     * checks and tag counts via timers.  Of course this means that on the very 1st call, we will always
     * appear to be not ready eventhough the DOM itself may be in a ready state, but our timeout interval
     * is small enough that this is OK.
     *
     * @name $sf.lib.dom-_ready_state_check
     * @private
     * @static
     * @function
     *
     */

    function _ready_state_check()
    {
      var b, kids, tag_cnt, lst, e;

      _clear_ready_timer_check();

      if (dom_ready_chk_tries >= dom_ready_chk_max_tries) {
        dom_last_known_child_node	= NULL;
        dom_is_ready 				= TRUE;
      }
      if (dom_is_ready === NULL) {
        try {
          b 				= (d && d.body);
          kids			= (b && tags("*",b));
          tag_cnt			= (kids && kids[LEN]);
          lst				= (b && b.lastChild);
        } catch (e) {
          dom_last_known_tag_count 	= 0;
          dom_last_known_child_node	= NULL;
        }

        if (dom_last_known_tag_count && tag_cnt == dom_last_known_tag_count && lst == dom_last_known_child_node) {
          dom_last_known_child_node 	= NULL;
          dom_is_ready 				= TRUE;
        } else {
          dom_last_known_tag_count 	= tag_cnt;
          dom_last_known_child_node	= lst;
          dom_ready_chk_tries		   += 1;
          dom_ready_chk_timer_id		= setTimeout(_ready_state_check, dom_ready_chk_try_interval);
        }
      } else {
        dom_last_known_child_node 	= NULL;
      }
    }

    /**
     * Detach onload handlers on iframes that we have created
     *
     * @name $sf.lib.dom.iframes-_unbind_iframe_onload
     * @private
     * @static
     * @function
     * @param {HTMLElement} el the iframe element to unbind from
     *
     */

    function _unbind_iframe_onload(el)
    {
      var id = attr(el,"id"), oldCB;

      oldCB = (id && iframe_cbs_attached[id]);
      if (oldCB) {
        detach(el, "load", oldCB);
        iframe_cbs_attached[id] = NULL;
        delete iframe_cbs_attached[id];
      }
    }

    /**
     * A default onload event handler for IFrames. We don't
     * want to attach to onload events for IFrames via attributes
     * b/c we don't want others to see what handlers are there.
     * In turn we also make sure the "this" reference for the outside
     * handle gets set properly, and it allows us to make sure
     * that unbinding of the event handler also gets handled always
     * so as not to create memory leak issues.
     *
     * @name $sf.lib.dom.iframes-_bind_iframe_onload
     * @private
     * @static
     * @function
     * @param {HTMLElement} el the iframe element to bind too
     * @param {Function} cb The onload handler from the outside
     *
     */

    function _bind_iframe_onload(el, cb)
    {
      var newCB, id;

      if (_callable(cb)) {

        /** @ignore */
        newCB = function(evt)
        {
          var tgt = evtTgt(evt), e;

          _unbind_iframe_onload(tgt);

          if (tgt && cb) {
            try {
              cb.call(tgt, evt);
            } catch (e) { }
          }

          tgt = el = cb = newCB = id = NULL;
        };

        id = attr(el,"id");
        _unbind_iframe_onload(el);

        if (id) iframe_cbs_attached[id]	= newCB;
        attach(el, "load", newCB);
      }

      newCB = NULL;
    }

    /**
     * Return the element reference passed in, and if its a string value passed
     * in use that to lookup the element by id attribute.
     *
     * @name $sf.lib.dom-_byID
     * @private
     * @static
     * @function
     * @param {HTMLElement|String} el  the element id / element reference
     * @return {HTMLElement|el}
     *
     */

    function _byID(el)
    {
      return (el && typeof el == STR) ? elt(el) || el : el;
    }

    /**
     * A proxy wrapper for calling into the cross-domain messaging host library
     *
     * @name $sf.lib.dom.iframes-_call_xmsg_host
     * @private
     * @static
     * @function
     * @param {String} methName The method name in the msg host library to call
     * @param {*} arg1 An arbitrary argument to pass to said method as the 1st arg
     * @param {*} arg2 An arbitrary argument to pass to said method as the 2nd arg
     * @param {*} arg3 An arbitrary argument to pass to said method as the 3rd arg
     * @return {*} whatever comes back from the method
     *
     */

    function _call_xmsg_host(methName, arg1, arg2, arg3)
    {
      var e;
      try {
        if (!iframe_msg_host_lib) iframe_msg_host_lib = dom.msghost;
      } catch (e) {
        iframe_msg_host_lib = NULL;
      }

      if (win != top) return;

      return methName && iframe_msg_host_lib && iframe_msg_host_lib[methName] && iframe_msg_host_lib[methName](arg1,arg2,arg3);
    }


    /**
     * Retrieve a document for a given HTML Element
     *
     * @memberOf $sf.lib.dom
     * @exports doc as $sf.lib.dom.doc
     * @static
     * @public
     * @function
     * @param {HTMLElement} el the HTML element for which you wish to find it's parent document
     * @return {Document|null} null if nothing found
     *
     */

    function doc(el)
    {
      var d = NULL;
      try {
        if (el) {
          if (el[NODE_TYPE] == 9) {
            d = el;
          } else {
            d = el[DOC] || el.ownerDocument || NULL;
          }
        }
      } catch (e) {
        d = NULL;
      }
      return d;
    }

    /**
     * Retrieve the host window object for a given HTML Element/document. Note that this is NOT the same as $sf.lib.dom.iframes.view, which
     * returns the window reference INSIDE the IFRAME element.
     *
     * @memberOf $sf.lib.dom
     * @exports view as $sf.lib.dom.view
     * @public
     * @static
     * @function
     * @param {HTMLElement|HTMLDocument} el the HTML element/document for which you wish to find it's parent window
     * @return {Document|null} null if nothing found
     *
     */

    function view(el)
    {
      var w = NULL, d, prop1 = "parentWindow", prop2 = "defaultView";

      try {
        if (el) {
          w = el[prop1] || el[prop2] || NULL;
          if (!w) {
            d = doc(el);
            w = (d && (d[prop1] || d[prop2])) || NULL;
          }
        }
      } catch (e) {
        w = NULL;
      }
      return w;
    }


    /**
     * Retrieve an element by its ID. . basically a short hand wrapper around document.getElementById.
     *
     * @memberOf $sf.lib.dom
     * @exports elt as $sf.lib.dom.elt
     * @public
     * @static
     * @function
     * @param {String} id (Required) the id of the HTML element to find
     * @param {HTMLElement|HTMLWindow|HTMLDocument} [par] The parent element,document,window to look for the given element
     * @return {HTMLElement|null} null if nothing found
     */

    function elt (id)
    {
      var args = arguments, len = args[LEN], dc;
      if (len > 1) {
        dc = doc(args[1]);
      } else {
        dc = d;
      }
      return (dc && dc.getElementById(id)) || NULL;
    }

    /**
     * A wrapper around retrieving the tagName of an HTML element (normalizes values to lower case strings).
     *
     * @memberOf $sf.lib.dom
     * @exports tagName as $sf.lib.dom.tagName
     * @static
     * @public
     * @function
     * @param {HTMLElement} el The HTML element for which to get the tag name.
     * @return {String} The tag name in all lower case of an HTML element, if it cannot be successfully retrieved, alwasys returns an empty string (which will evaluate to FALSE).
     *
     */

    function tagName(el)
    {
      return (el && el[NODE_TYPE] == 1 && el.tagName[TLC]()) || "";
    }

    /**
     * A wrapper around retrieving a list of tags by name.
     *
     * @memberOf $sf.lib.dom
     * @exports tags as $sf.lib.dom.tags
     * @static
     * @public
     * @function
     * @param {String} name The name of the tags that you wish to look for, note that you can pass in "*" to find all.
     * @param {HTMLElement|Document} [parNode] the parent node that you wish to look in
     * @return {HTMLElementCollection} List of tags found. Note that is NOT a real JavaScript Array
     *
     */

    function tags(name, parNode)
    {
      var ret = [], e;

      try {
        if (parNode && parNode[GTE]) {
          ret = parNode[GTE](name) || ret;
        } else {
          ret = d[GTE](name) || ret;
        }
      } catch (e) {
        ret = [];
      }
      return ret;
    }


    /**
     * Retrive the parent element of an HTML element
     *
     * @memberOf $sf.lib.dom
     * @exports par as $sf.lib.dom.par
     * @public
     * @static
     * @function
     * @param {HTMLElement} el the HTML element to check
     * return {HTMLElement} the new reference to the parent element or null
     *
     */

    function par(el) { return el && (el.parentNode || el.parentElement); }


    /**
     * Retrieve/Set/Delete an element's attribute. Note that this handle's
     * slight differences in the way HTML attributes are handled across browsers
     * as well as being shorthand
     *
     * @memberOf $sf.lib.dom
     * @exports attr as $sf.lib.dom.attr
     * @static
     * @public
     * @function
     * @param {HTMLElement} el the HTML element to manipulate
     * @param {String} attrName the attribute to set/get
     * @param {String} [attrVal], if specified will set the value of the attribute for this element.  Passing null will remove the attribute completely
     * @return {String} the value of the attribute normalized to a string (may be empty)
     */
    /*
     * Note that we probably could have 2 differnet functions here instead of forking internally
     * but the functions are essentially the same, and it just creates a lot of dead code
     *
    */

    function attr(el,attrName,attrVal)
    {
      var e;
      try {
        if (arguments[LEN] > 2) {
          if (attrVal === NULL) {
            if (useOldStyleAttrMethods) {
              el[RM](attrName, 0);
            } else {
              el[RM](attrName);
            }
          } else {
            attrVal = _cstr(attrVal);
            if (attrName[TLC]() == "class") {
              el.className = attrVal;
            } else {
              if (useOldStyleAttrMethods) {
                el[ST](attrName, attrVal, 0);
              } else {
                el[ST](attrName, attrVal);
              }
            }
          }
        } else {
          if (useOldStyleAttrMethods) {
            attrVal = _cstr(el[GT](attrName, 0));
          } else {
            attrVal = _cstr(el[GT](attrName));
          }
        }
      } catch (e) {
        attrVal = "";
      }
      return attrVal;
    }

    /**
     * Set/Get the CSS text of an HTML element
     *
     * @memberOf $sf.lib.dom
     * @exports css as $sf.lib.dom.css
     * @public
     * @static
     * @function
     * @param {HTMLElement} el the HTML element to manipulate
     * @param {String} [val] the CSS string to set if specified (e.g. "background-color:transparent;position:absolute;top:0px;left:0px").
     * @return {String} the value of the attribute normalized to a string (may be empty)
     */

    function css(el, val)
    {
      var st;

      try {
        st	= el.style;

        if (arguments[LEN] > 1) {
          st.cssText = _cstr(val);
        } else {
          val = st.cssText;
        }
      } catch (e) {
        val = "";
      }
      return val;
    }

    /**
     * Make a new element
     *
     * @name $sf.lib.dom.make
     * @exports make_element as $sf.lib.dom.make
     * @static
     * @public
     * @function
     * @param {String} tagName
     * @param {Document|HTMLElement|Window} [parent] element, document, or window to make the tag in, optional.
     * @return {HTMLElement}
     *
     */

    function make_element(tagName, par)
    {
      return ((arguments[LEN]>1 && doc(par)) || d).createElement(tagName);
    }


    /**
     * Append and HTMLElement to another HTMLElement
     *
     * @memberOf $sf.lib.dom
     * @exports append as $sf.lib.dom.append
     * @public
     * @static
     * @function
     * @param {HTMLElement} parNode the HTML element to manipulate
     * @param {HTMLElement} child (Required) the new HTML element to add to the parent
     * return {HTMLElement|Boolean} the new reference to the child element that was appended, or FALSE if failure
     *
     */

    function append(parNode,child)
    {
      var success = FALSE, e;
      try {
        if (parNode) success = parNode.appendChild(child);
      } catch (e) {
        success = FALSE;
      }
      return success;
    }


    /**
     * A wrapper method for removing elements from a document rather than calling parentNode.removeChild raw.
     * Has special processing to ensure that contents of IFRAME tags gets released from memory as well
     *
     * @memberOf $sf.lib.dom
     * @exports purge as $sf.lib.dom.purge
     * @static
     * @public
     * @function
     * @param {HTMLElement} node The HTML element to be removed from the dom
     * @return {Boolean} Whether or not the element was successfully removed
     *
     */

    function purge(node)
    {
      var success = FALSE, parNode, isIFrame = (tagName(node) == IFRAME), e;

      if (isIFrame) {
        /*
         * If it's an iframe we want to make sure to call into
         * our other internal libraries and unbind anything that
         * we might have attached.
        */

        _call_xmsg_host("detach", node)
        _unbind_iframe_onload(node);


        /*
         * We also want to unload / nuke the contents
         * but with IE unfornately we cannot set the "src"
         * attribute b/c that will lead to the annoying click / navigation sound
         *
        */

        if (!isIE) attr(node,"src",BLANK_URL);

      }

      try {
        parNode = par(node);
        if (parNode) {
          parNode.removeChild(node);
          success = TRUE;

          /*
           * Since we can't set the "src" attribute for IE,
           * we just call into the garbage collector
           *
          */
          if (isIE && isIFrame) gc();
        }
      } catch (e) { }

      node = parNode = NULL;
      return success;
    }

    /**
     * Attach an event handler to an HTMLElement.  Note normalize event names to lower case / w3c standards.
     * See example.
     *
     * @memberOf $sf.lib.dom
     * @exports attach as $sf.lib.dom.attach
     * @public
     * @static
     * @function
     * @param {HTMLElement} el the HTML element to attach an event handler too
     * @param {String} name the name of the event to listen too
     * @param {Function} cb the function used to handle the particular event
     *
     * @example
     * var el = $sf.lib.dom.elt("my_element");
     * function handle_click(evt)
     * {
     *      alert('i was clicked');
     * }
     *
     * $sf.lib.dom.attach(el,"click",handle_click);
     *
     */
    /*
     * It seems a shame to have to fork at run time, but again, it would add a fair amount
     * of function body weight just to change one line of code.
     *
    */

    function attach(obj, name, cb)
    {
      try {
        if (use_ie_old_attach) {
          obj[use_attach]("on"+name,cb);
        } else {
          obj[use_attach](name,cb,FALSE);
        }
      } catch (e) {

      }
      obj = cb = NULL;
    }

    /**
     * Detach an event handler to an HTMLElement
     *
     * @memberOf $sf.lib.dom
     * @exports detach as $sf.lib.dom.detach
     * @public
     * @static
     * @function
     * @param {HTMLElement} el the HTML element to attach an event handler too
     * @param {String} namethe name of the event to listen too
     * @param {Function} cb the function used to handle the particular event
     *
     */

    function detach(obj, name, cb)
    {
      try {
        if (use_ie_old_attach) {
          obj.detachEvent("on"+name, cb);
        } else {
          obj.removeEventListener(name, cb, FALSE);
        }
      } catch (e) {

      }
      obj = cb = NULL;
    }

    /**
     * Returns whether or not the DOM is ready to be manipulated
     *
     * @memberOf $sf.lib.dom
     * @exports ready as $sf.lib.dom.ready
     * @public
     * @static
     * @function
     * @return {Boolean}
     *
     */

    function ready()
    {
      var rs;

      _clear_ready_timer_check();

      if (dom_is_ready) {
        dom_last_known_child_node = NULL;
        return TRUE;
      }

      rs = d.readyState;

      if (rs) {
        dom_last_known_child_node = NULL;
        if (rs == "loaded" || rs == "complete") {
          dom_is_ready = TRUE;
        } else {
          dom_is_ready = FALSE;
        }
      }

      /*
       * there is no document.readyState property available, so kick off our timer function
       * that will check.
       *
      */

      dom_last_known_child_node	= NULL;
      dom_ready_chk_tries			=
        dom_last_known_tag_count	= 0;
      _ready_state_check();
      return !!(dom_is_ready);
    }


    /**
     * Fire off a particular function when it is detected that the DOM is ready
     * Useful when you don't know for sure if the DOM of the browser is ready or not, so this will detect and fire
     * your function for you.
     *
     * @memberOf $sf.lib.dom
     * @exports wait as $sf.lib.dom.wait
     * @public
     * @static
     * @function
     * @param {Function} cb A function reference to be called when the DOM is ready
     *
     */

    function wait(cb)
    {
      var rdy = ready(), e;
      if (rdy) {
        try {
          if (lang.callable(cb)) cb();
        } catch (e) {
          e = NULL;
        }
        return;
      }
      setTimeout(function() { wait(cb); cb = NULL; }, dom_ready_chk_try_interval+1);
    }


    /**
     * Cancel the the default action of a particular DOM event
     *
     * @memberOf $sf.lib.dom
     * @exports evtCncl as $sf.lib.dom.evtCncl
     * @public
     * @static
     * @function
     * @param {HTMLEvent} evt  The raw HTML event
     *
     */

    function evtCncl(evt)
    {
      var prop = "", e;

      evt = evt || win.event;

      if (evt) {
        /* old school ie, cancel event and bubble
           however we also use this for when event handling overrides
           take place so that we can cancel things
        */
        try {
          evt.returnValue = FALSE;
        } catch (e) { }
        try {
          evt.cancelBubble = TRUE;
        } catch (e) {  };
        try {
          evt.stopped		 = TRUE; //custom
        } catch (e) { };

        for (prop in EVT_CNCL_METHODS)
        {
          if (EVT_CNCL_METHODS[prop]) {
            try {
              evt[prop]();
            } catch (e) { }
          }
        }
      }
      return FALSE;
    }

    /**
     * Return the target/srcElement of an event from an HTML element
     *
     * @memberOf $sf.lib.dom
     * @exports evtTgt as $sf.lib.dom.evtTgt
     * @public
     * @static
     * @function
     * @param {HTMLEvent} evt The raw HTML event
     *
     */

    function evtTgt(evt)
    {
      var tgt = NULL;

      try {
        evt = evt || win.event;
        tgt = (evt) ?  (evt[evt_tgt_prop_a] || evt[evt_tgt_prop_b]) : NULL;
      } catch (e) {
        tgt = NULL;
      }
      return tgt;
    }


    /**
     * @namespace $sf.lib.dom.iframes Defines helper functions for dealing specifically with IFRAME tags, which is key to SafeFrames tech in a browser.
     * @name $sf.lib.dom.iframes
     * @requires $sf.lib.lang
     *
     */


    /**
     * Clones an iframe. . .
     * This code creates / clones iframe tags in a very specific way to ensure both optimal performance and stability.
     * We use string buffers to build markup internally, which is typically faster than using all DOM APIs.  Also
     * we allow the usage of the "name" attribute as a data pipeline, which in turn allows for synchronous downward
     * x-domain messaging.
     *
     * @name $sf.lib.dom.iframes.clone
     * @static
     * @public
     * @function
     * @param {HTMLElement/String} el  An iframe element or id of an iframe element to clone
     * @param {Object} [attrs]  A hash map of other attributes to be set on the iframe.  Do not set style properties for the frame here, see the next argument for that.
     * @param {String} [cssText]  The style string (as in what you would use in HTML markup, e.g. "background-color:red;border:solid 3px blue;"), to use for this iframe
     * @param {Function} [cb]  An optional callback function to specify for when the iframe loads.
     * @param {Function} [xmsgCB] An optional call back for receiving messages from the iframe
     * @return {HTMLElement}  the iframe node if succesfully created or NULL.  Note that this does not insert the iframe into the document for you. . .
     *
     */
    function clone_iframe(el, attrs, cssText, cb, xmsgCB)
    {
      return _clone_iframe(el, attrs, cssText, cb, xmsgCB);
    }


    /** @ignore */
    function _clone_iframe(el, attrs, cssText, cb, xmsgCB, iframe_skip_clone)
    {
      var bufferHTML 	= ["<", IFRAME, " "],
        xmsgPipe	= "",
        prop, temp, cl, newCl, html, attrStr;

      if (!iframe_skip_clone) {
        el 		= _byID(el);
        if (tagName(el) != IFRAME) return NULL;

        cl 			= el.cloneNode(FALSE);
      } else {
        cl = el;
      }
      attrs		= attrs || {};

      if ("src" in attrs) {
        attr(cl,"src",NULL);
      } else {
        attrs.src = attr(el,"src") || BLANK_URL;
      }
      if ("name" in attrs) {
        attr(cl,"name",NULL);
      } else {
        attrs.name = attr(el,"name");
      }
      if (!attrs.src) attrs.src = BLANK_URL;

      xmsgPipe = xmsgCB && _call_xmsg_host("prep",attrs);

      if (!iframe_skip_clone) {
        attr(cl,"width",	NULL);
        attr(cl,"height",	NULL);
      }

      if (cssText) {
        //Lucky for us that duplicate style props will override each other so long as i put mine after. .

        temp = css(cl);
        if (temp && temp.charAt(temp[LEN]-1) != ";")
          temp += ";";

        css(cl, [temp,_cstr(cssText)]);
      }

      temp	= make_element("div");
      append(temp,cl);

      html	= temp.innerHTML;
      attrStr	= html.replace(/<iframe(.*?)>(.*?)<\/iframe>/gim, "$1");

      bufferHTML.push("name=\"", attrs.name, "\" ", attrStr, "></", IFRAME, ">");

      delete attrs.name; //delete it so that we are not calling setAttribute with "name" since IE doesn't like that

      temp.innerHTML 	= _cstr(bufferHTML);
      newCl	 		= temp.firstChild;
      for (prop in attrs)
      {
        attr(newCl,prop,attrs[prop]);
      }

      if (!attr(newCl,"id")) {
        attr(newCl,"id", "sf_" + IFRAME + "_" + iframe_next_id);
        iframe_next_id++;
      }

      attr(newCl,"FRAMEBORDER","no");
      attr(newCl,"SCROLLING","no");
      attr(newCl,"ALLOWTRANSPARENCY",TRUE);
      attr(newCl,"HIDEFOCUS",TRUE);
      attr(newCl,"TABINDEX",-1);
      attr(newCl,"MARGINWIDTH",0);
      attr(newCl,"MARGINHEIGHT",0);

      _bind_iframe_onload(newCl,cb);

      if (xmsgPipe) _call_xmsg_host("attach",newCl,xmsgPipe,xmsgCB);

      xmsgPipe = xmsgCB = cl = cb = el = temp = null;

      return newCl;
    }


    /**
     * Make a new iframe
     *
     * @name $sf.lib.dom.iframes.make
     * @static
     * @public
     * @function
     * @param {Object} attrs  A hash map of other attributes to be set on the iframe.  Do not set style properties for the frame here, see the next argument for that.
     * @param {String} [cssText]  The style string (as in what you would use in HTML markup, e.g. "background-color:red;border:solid 3px blue;"), to use for this iframe
     * @param {Function} [cb]  An callback function to specify for when the iframe loads.
     * @param {Function} [xmsgCB] An call back for receiving messages from the iframe
     * @return {HTMLElement}  the iframe node if succesfully created or NULL.  Note that this does not insert the iframe into the document for you. . .
     *
     */

    function make_iframe(attrs, cssText, cb, xmsgCB)
    {
      return _clone_iframe(make_element(IFRAME), attrs, cssText, cb, xmsgCB, TRUE);
    }

    /**
     * A method to insert or replace an HTML tag with an IFRAME tag, with a new URL and attributes.
     *
     * Used for 3 reasons:
     *<ol>
     * <li>It avoids click sounds on IE.</li>
     * <li>It allows always resetting the window.name property of the iframes underlying HTMLWindow object, unforunately IE will not let you set this attribute on a clone.</li>
     * <li>It ensures that event handlers in the underlying document for unloading are executed.</li>
     * <li>Changing the src attribute directly will result in a browser history update, which we do not want.</li>
     *</ol>
     *
     * We could just change location.href property or call location.replace, however that is not always  possible since
     * the frame could be x-domain.
     *
     * @name $sf.lib.dom.iframes.replace
     * @function
     * @static
     * @public
     * @param {Object} attrs  A hash map of other attributes to be set on the iframe.  Do not set style properties for the frame here, see the next argument for that.
     * @param {String} [cssText]  The style string (as in what you would use in HTML markup, e.g. "background-color:red;border:solid 3px blue;"), to use for this iframe
     * @param {HTMLElement|String} [parRef]  An parent element or parent element id, to be used only if a new iframe is created, the iframe will be append to that parent, if not specified document body is used
     * @param {Function} [cb]  An callback function to specify for when the iframe loads.
     * @param {Function} [xmsgCB] An call back for receiving messages from the iframe
     *
     * @return {HTMLElement} a reference to the newly created iframe element if successfully inserted, otherwise NULL.
     */

    function replace_iframe(attrs, cssText, parRef, cb, xmsgCB)
    {
      var cl, el, frameEl, elID, tgn, parNode, e;

      attrs		= attrs || {};
      elID		= attrs.id;
      el			= elID && _byID(elID);
      tgn			= tagName(el);
      el			= (tgn) ? el : NULL;
      frameEl		= (tgn == IFRAME) ? el : NULL;

      if (frameEl) {

        _call_xmsg_host("detach",frameEl);
        _unbind_iframe_onload(frameEl);

        parNode = par(frameEl);
        cl		= clone_iframe(frameEl, attrs, cssText, cb, xmsgCB);

        //remove these attrs, since they will be reset
        attr(cl, "onload",NULL);
        attr(cl, "onreadystatechange",NULL);
      } else {
        if (parRef) {
          parRef = _byID(parRef);
          if (tagName(parRef)) parNode = parRef;
        }
        if (!parNode && el) parNode = par(el);

        cssText	= _cstr(cssText) || css(el) || "";
        cl		= make_iframe(attrs, cssText, cb, xmsgCB);
      }

      try {
        if (!parNode) {
          append(d.body,cl);
        } else {
          if (frameEl) {
            parNode.replaceChild(cl, frameEl);
          } else {
            if (el) {
              parNode.replaceChild(cl,el);
            } else {
              append(parNode,cl);
            }
          }
        }
      } catch (e) { }

      cl = el = attrs = frameEl = parNode = cb = NULL;
      return elt(elID);
    }


    /**
     * Retrieve the window reference inside of an IFRAME. Not to be confused with $sf.lib.dom.view which
     * returns the parent window reference of an element.
     *
     * Note that even in cross-domain scenarios, you are supposed to able to get access to the window reference.
     * In a cross-domain scenario, you would not be able to then acesss most properties / methods / objects of that
     * window, but the reference itself is allowed.
     *
     * @name $sf.lib.dom.iframes.view
     * @public
     * @static
     * @function
     * @param {HTMLElement} el The iframe element to safely get back the window
     * @return {HTMLWindow} the window reference inside the iframe.
     *
     */

    function iframe_view(el)
    {
      var win, elWin, elDoc, frame_list, frame, fe, idx = 0, e, err;
      try {
        win = el.contentWindow || NULL;

        /*
         * We are allowed access, but sometimes, non-ie browser will report NULL
         * so in this case we loop through the window frames to see if that is really
           the case
        */

        if (!win) {
          elDoc		= doc(el);
          elWin		= (elDoc && view(elDoc));
          frame_list	= (elWin && elWin.frames) || [];
          while (frame = frame_list[idx++])
          {
            try {
              fe = frame.frameElement;
            } catch (err) {
              fe = NULL;
            }
            if (fe && fe == el) {
              win = frame;
              break;
            }
          }
        }
      } catch (e) {
        win = NULL;
      }
      return win;
    }

    /**
     * Write an entry to the console log and fire any log listeners
     *
     * @message  The log message
     */

    function logInfo(message)
    {
      if(win.console && console.log){
        console.log(message);
      }
    }

    /**
     * Write an entry to the console error log and fire any log listeners
     *
     * @message  The log message
     */

    function logError(message)
    {
      if(win.console && console.error){
        console.error(message);
      }
      else if(win.console && console.log){
        console.log(message);
      }
    }

    /*
     * Do some internal intialization below.  Some variable aren't really used beyond this intialization phase, hence
     * why we have a 2ndary inner function.  We also want to have some functions defined differently based on the browser
     * for run-time performance reasons (however we only do this if the function body is significantly different, otherwise
     * we just fork internally inside a functional wrapper).
     *
    */
    /** @ignore */
    (function() {
      var obj, ATTR_NAME = "SCROLLING", CREATE_EVENT = "createEvent", EVT_TYPE = "UIEvent", prop, err;

      if (isIE) {
        evt_tgt_prop_a	= "srcElement";
        evt_tgt_prop_b	= "target";
        obj				= make_element(IFRAME);

        attr(obj,ATTR_NAME, "no");

        useOldStyleAttrMethods = (attr(obj,ATTR_NAME) != "no");

        if (GC in win) {
          /*
           * While this method is technically public, we do not document it.
           * IE has a super-secret method to call the garbage collector.  It was implemented
           * b/c IE, due to its own issues with internal reference counting, did not always trigger
           * garabage collection properly.  This happens to be the case often when dealing with one
           * or more IFRAMEs.  Often times you will find that an IFRAME that is removed from the dom
           * actually never gets unloaded (and thereby never fires the onunload event either).
           *
           * Calling IE's internal method helps make sure this happens.
           *
          */

          /** @ignore */
          gc		= function()
          {
            if (gc_timer_id) clearTimeout(gc_timer_id);
            gc_timer_id = setTimeout(function() { try { win[GC](); } catch (e) {} }, IE_GC_INTERVAL);
          }

        } else {
          gc		= _lang.noop;
        }
      } else {
        evt_tgt_prop_a	= "target";
        evt_tgt_prop_b	= "currentTarget";
      }

      if (win[w3c_attach] && !isIE) {
        use_attach = w3c_attach;
        use_detach = w3c_detach;
      } else if (isIE) {
        use_ie_old_attach 	= TRUE;
        use_attach 			= ie_attach;
        use_detach 			= ie_detach;
      }

      /*
       * We have a method for cancelling event propagation / bubbling
       * which will even work in cases where cancelling is typically not allowed
       * so long as we have control over the handlers
       *
       * In turn we want to be able to call the proper supported methods
       * regardless of browser type, so we look at the w3c style of creating
       * events and if that can be used, then we want to make sure and call those
       * cancelling methods that are supported
       *
      */

      obj = NULL;
      try {
        obj = d[CREATE_EVENT](EVT_TYPE);
      } catch (err) {
        obj = NULL;
      }
      if (!obj) {
        try {
          obj = d[CREATE_EVENT](EVT_TYPE+"s");
        } catch (err) {
          obj = NULL;
        }
      }
      if (obj) {
        for (prop in EVT_CNCL_METHODS)
        {
          if (obj[prop]) EVT_CNCL_METHODS[prop] = 1;
        }
      }

      obj = NULL;

      /* we attach load event handlers to also allow us to know as soon as
       * possible when dom is ready.  this script may have been loaded async
       * though, which is why our ready check does some other things to check for
       * certain
       *
      */

      attach(win, "load",  _handle_dom_load_evt);
      attach(win, DCLDED,	 _handle_dom_load_evt);

      dom = lang.def(IAB_LIB + ".dom",
        {

          /* DOM Query function */

          doc:			doc,
          view:			view,
          elt:			elt,
          tagName:		tagName,
          tags:			tags,
          par:			par,

          /* DOM manipulate functions */

          make: 			make_element,
          css:			css,
          attr:			attr,
          gc:				gc,
          append:			append,
          purge:			purge,

          /* DOM event functions */

          attach:			attach,
          detach:			detach,
          ready:			ready,
          wait:			wait,
          evtCncl:		evtCncl,
          evtTgt:			evtTgt

        }, NULL, TRUE);

    })();


    iframes = lang.def(IAB_LIB + ".dom.iframes",
      {
        make:		make_iframe,
        clone:		clone_iframe,
        replace:	replace_iframe,
        view:		iframe_view

      }, NULL, TRUE);

    logger = lang.def(IAB_LIB + ".logger",
      {
        log:	logInfo,
        error: 	logError
      }, NULL, TRUE);

    info = lang.def(IAB_INF,
      {
        errs:	[],
        list: 	[]
      }, NULL, TRUE);


    // Add Javascript shims
    //IE doesn't support string.trim
    if(!S[PROTO].trim) S[PROTO].trim = lang.trim;

  })();

})(window);

/*
* Copyright (c) 2012, Interactive Advertising Bureau
* All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

*/

/**
 * @namespace $sf.host Defines the Publisher side api, and helper functions
 * @name $sf.host
 * @author <a href="mailto:ssnider@yahoo-inc.com">Sean Snider</a>
 * @author <a href="mailto:ccole[AT]emination.com">Chris Cole</a>
 * @version 1.1.0
 *
 */

/** @ignore */
(function(win) {

  var NULL						= null,
    TRUE						= true,
    FALSE						= false,
    DEFAULT_RENDER_TIMEOUT		= 60000,
    POS_ID_AUTO_PREFIX			= "sf_pos",
    POS_REL_BOX_ID_PREFIX		= "sf_pos_rel_el",
    SF_DATATAG_CLASS			= "sf_data",
    SF_POSELEM_WRAPPER_CLASS	= "sf_position",
    AUTO_BOOT_MAX_RETRIES		= 100,
    GEOM_UPDATE_INTRVAL			= 750,
    XCOM_RESP_DELAY				= 1,
    IE_BORDER_ADJ				= 2,
    INTERSECT_FACTOR			= 10,
    BF_POS_MSG					= "onBeforePosMsg",
    POS_MSG						= "onPosMsg",
    SUPPORTS_FEATURES			=
      {
        "exp-ovr":			1,
        "exp-push":			0,
        "bg":				0,
        "pin":				0,
        "read-cookie":		0,
        "write-cookie":		0
      },
    EXPAND_COMMAND 			= "exp-ovr",
    COLLAPSE_COMMAND 		= "collapse",
    ERROR_COMMAND 			= "error",
    NOTIFY_EXPAND			= "expand",
    NOTIFY_GEOM_UPDATE		= "geom-update",
    NOTIFY_COLLAPSE			= COLLAPSE_COMMAND,
    NOTIFY_FOCUS_CHANGE		= "focus-change",
    DEFAULT_ZINDEX			= 3000,
    OBJ						= "object",
    FUNC					= "function",
    STR						= "string",
    ST						= "style",
    PROTO					= "prototype",
    LEN						= "length",
    WIDTH					= "width",
    HEIGHT					= "height",
    PX						= "PX",
    CLIP					= "clip",
    SCROLL					= "scroll",
    ONSCROLL				= "onscroll",
    COMPAT_MODE				= "compatMode",
    DOC_EL					= "documentElement",
    DOC						= "document",
    NODE_TYPE				= "nodeType",
    CONTAINS				= "contains",
    COMPARE_DOC_POS			= "compareDocumentPosition",
    EL_FROM_PT				= "elementFromPoint",
    AUTO					= "auto",
    HIDDEN					= "hidden",
    OVER					= "overflow",
    TFXD					= "toFixed",
    ATTACH					= "attach",
    DETACH					= "detach",
    MSG						= "message",
    PMSG					= "postMessage",
    GUID					= "guid",
    FLASH_MIME 				= "application/x-shockwave-flash",
    sf						= (win && win.$sf),
    VERSION					= (sf && sf.ver),
    env						= (sf && sf.env),
    ua						= (env && env.ua),
    lib						= (sf && sf.lib),
    lang					= (lib && lib.lang),
    dom						= (lib && lib.dom),
    iframes					= (dom && dom.iframes),
    _cbool					= (lang && lang.cbool),
    _cnum					= (lang && lang.cnum),
    _cstr					= (lang && lang.cstr),
    _callable				= (lang && lang.callable),
    _noop					= (lang && lang.noop),
    _guid					= (lang && lang[GUID]),
    _mix					= (lang && lang.mix),
    _elt					= (dom && dom.elt),
    _par					= (dom && dom.par),
    _tags					= (dom && dom.tags),
    _attr					= (dom && dom.attr),
    _doc					= (dom && dom.doc),
    _tagName				= (dom && dom.tagName),
    _view					= (dom && dom.view),
    _ifr_view				= (iframes && iframes.view),
    _purge					= (dom && dom.purge),
    _ready					= (dom && dom.ready),
    _es						= (win && win.escape),
    M						= (win && win.Math),
    _max					= (M && M.max),
    _min					= (M && M.min),
    _round					= (M && M.round),
    _rect					= NULL,
    ParamHash				= (lang && lang.ParamHash),
    dc						= (win && win[DOC]),
    isIE					= (env && env.isIE),
    ieVer					= ((ua && ua.ie) || 0),
    wbVer					= ((ua && ua.webkit) || 0),
    geckVer					= ((ua && ua.gecko) || 0),
    operaVer				= ((ua && ua.opera) || 0),
    loc						= (win && win.location),
    locHost					= (loc && ((loc.protocol + "//" + (loc.host||loc.hostname)) || "")), // missing the port number

    rendered_ifrs			= {},
    msg_pipes				= {},
    ifr_dest_id_map 		= {},
    pending_ifrs			= {},
    complete_ifrs			= {},
    scroll_parents_attached	= {},
    mgr_bounds_details		= FALSE,
    canUseHTML5				= FALSE,
    html5Bound				= FALSE,
    win_events_attached		= FALSE,
    geom_update_timer		= 0,
    focus_update_timer		= 0,
    current_status			= NULL,
    msghostfb				= NULL,
    flash_ver 				= NULL,
    config					= NULL;

  var flashActiveXVersions = [
    "ShockwaveFlash.ShockwaveFlash.11",
    "ShockwaveFlash.ShockwaveFlash.8",
    "ShockwaveFlash.ShockwaveFlash.7",
    "ShockwaveFlash.ShockwaveFlash.6",
    "ShockwaveFlash.ShockwaveFlash"
  ];

  /* --BEGIN-SafeFrames publisher data class definitions */

  /**
   * Configure the base-level settings for the SafeFrames library
   * Note that only one configuration can be active at a given time.
   * Therefore you cannot change the configuration by creating a new $sf.host.Config while
   * the SafeFrames library is busy (however you can add new position configurations).
   * Instatiating a new config, when the library is not busy will destroy / remove all currently
   * managed positions and there configurations.
   *
   * @name $sf.host.Config
   * @constructor
   * @public
   * @param {Object} conf An object containing properties for configuration
   * @param {Boolean} [conf.auto] Whether or not to have SafeFrames automatically boostrap an render any SafeFrames tags within the page
   * @param {String} conf.cdn The protocol,host name, and port parts of a URI, that is a 2ndary origin, used with SafeFrames to render content. For example JS files would be loaded from conf.cdn+"/"+conf.root+"/"+conf.version+"/[filename]"
   * @param {Boolean} [conf.debug] Whether or not debug mode is on or off
   * @param {String} conf.root The root path part of the URI that is a 2ndary origin, used with SafeFrames to render content. For example the HTML file for rendering content into would beloaded from conf.cdn+"/"+conf.root+"/"+conf.version+"/"+conf.renderFile
   * @param {String} conf.renderFile The filename (may also include path info), for which to render content into via a SafeFrame.
   * @param {String} [conf.msgFile] The filename (may also include path info), for which to use as a proxy for x-domain messaging whenever HTML5 messaging is not available. Only required if supporting older browsers.
   * @param {Number} [conf.to] The maximum amount of time in milliseconds to wait for a SafeFrame to finish rendering, defaults to 60 seconds.
   * @param {Function} [conf.onBeforePosMsg] A callback function that gets fired before any cancellable action is requested to be peformed from a a SafeFrame, such as expansion, etc.  Return true out of this callback function to cancel/disallow the action in question.
   * @param {Function} [conf.onPosMsg] A callback function that gets fired when an action requested by a SafeFrame is performed
   * @param {Function} [conf.onStartPosRender] A callback function that gets fired when a SafeFrame starts to render 3rd party content.
   * @param {Function} [conf.onEndPosRender] A callback function that gets fired when a SafeFrame finishes rendering 3rd party content.
   * @param {Object} [conf.positions] A map of positions to automatically configure, where each key equals the id of the $sf.host.PosConfig object, and the value is an object containing said object's settings.
   *
   */

  function Config(conf)
  {
    var me = this, pos_map, conf_pos_map, posID, pos_conf, pos_id, boot_up;

    if (!arguments.length) return (config) ? _mix({}, config) : NULL;

    if (!(me instanceof Config)) return new Config(conf);

    if (!conf) {
      config = NULL;
      return NULL;
    }
    boot_up				= !!(config);
    me.auto				= ("auto" in conf) ? _cbool(conf.auto) : TRUE;
    me.cdn				= _cstr(conf.cdn);
    me.debug			= _cbool(conf.debug);
    me.root				= _cstr(conf.root);
    me.renderFile		= _cstr(conf.renderFile);
    me.msgFile			= _cstr(conf.msgFile);
    me.to				= _cnum(conf.to, DEFAULT_RENDER_TIMEOUT);
    me.ver				= _cstr(conf.ver) || VERSION;
    me.onBeforePosMsg	= _callable(conf.onBeforePosMsg) ? conf.onBeforePosMsg : _noop;
    me.onPosMsg			= _callable(conf.onPosMsg) ? conf.onPosMsg : _noop;
    me.onStartPosRender	= _callable(conf.onStartPosRender) ? conf.onStartPosRender : _noop;
    me.onEndPosRender	= _callable(conf.onEndPosRender) ? conf.onEndPosRender : _noop;
    me.onFailure 		= _callable(conf.onFailure) ? conf.onFailure3 : _noop;

    conf_pos_map		= conf.positions;
    me.positions		= pos_map = {};

    if (conf_pos_map) {
      for (posID in conf_pos_map)
      {
        pos_conf = conf_pos_map[posID];
        if (pos_conf && typeof pos_conf == OBJ) {
          pos_id			= posID || pos_conf.id || _guid(POS_ID_AUTO_PREFIX);
          pos_map[pos_id]	= new PosConfig(pos_conf);
        }
      }
    }
    config	= me;
    boot_up = !!(boot_up && me.auto && lang && lang.ns("$sf.host.boot"));

    try {
      if (boot_up) sf.host.boot();
    } catch (e) {

    }
    return _mix({},config);
  }

  /**
   * Configure a particualar position for rendering a SafeFrame
   * Each $sf.host.PosConfig object has an id property that should be unique.  Creating a new $sf.host.PosConfig with an id, that has already been
   * used results in changing the old $sf.host.PosConfig settings, and can only be done if the SafeFrames library is not busy.
   * Automatically ads to the position map of the $sf.host.Config object if said config has already been created.
   *
   * @name $sf.host.PosConfig
   * @public
   * @constructor
   * @param {Object|String} posIDorObj The id of the $sf.host.PosConfig instance, or an object containing all settings that are to be used for the instance.
   * @param {String} [posIDorObj.id] The id of the $sf.host.PosConfig instance, if not specified one will be generated automatically.
   * @param {String} [posIDorObj.dest] The HTML element id attribute of the HTML element in the document where a SafeFrame will be rendered. Said element MUST exist within the page prior to a render.
   * @param {String} [posIDorObj.bg] The color of the background to be used inside the SafeFrame. Default equals "transparent".
   * @param {String} [posIDorObj.tgt] The name of the target window where hyperlinks inside a SafeFrame will navigate too...Note that "_self" is not allowed and always converted to "_top". Allowed values are any string value not prefixed with "_", or "_top" or "_blank".
   * @param {String} [posIDorObj.css] A string of CSS rules, or a URL that points to a CSS style sheet to be used inside the SafeFrame
   * @param {Number} [posIDorObj.w] The width of the SafeFrame, specified in pixels. Cannot be specified in em, % or another values.
   * @param {Number} [posIDorObj.h] The height of the SafeFrame, specified in pixels. Cannot be specified in em, % or another values.
   * @param {String} [posIDorObj.size] A string formated as "widthXheight", that defines the width and height of the SafeFrame. The delimiter character "X" is can be specified as lower or upper case.
   * @param {String} [posIDorObj.z] The z-index of the SafeFrame.
   * @param {Object} [posIDorObj.supports] An object containing key/value pairs for what features/actions are supported by the SafeFrame, and its corresponding value represents a boolean detereming whether that feature can be used.  Currently supported keys are "exp-ovr" == SafeFrame can expand in overlay mode, "exp-push" == SafeFrame can expand in push mode, and "bg" == SafeFrame can change the background of the publisher / host.
   * @param {String} [destID] The HTML element id attribute of the HTML element in the document where a SafeFrame will be rendered. Said element MUST exist within the page prior to a render.
   * @param {Object} [baseConf] An object representing a $sf.host.Config object to automatically use / create for the SafeFrames library. Note that baseConf can only be used one time, otherwise you have to use the $sf.host.Config object directly.
   *
   */

  function PosConfig(posIDorObj, destID, baseConf)
  {
    var me = this, typ = (posIDorObj && typeof posIDorObj) || "", sz, sz_split;

    if (!(me instanceof PosConfig)) return new PosConfig(posIDorObj,destID,baseConf);

    if (typ == OBJ) {
      me.id		= _cstr(posIDorObj.id);
      me.dest		= _cstr(posIDorObj.dest || destID);
      me.bg		= _cstr(posIDorObj.bg) || "transparent";
      me.tgt		= _cstr(posIDorObj.tgt) || "_top";
      me.css		= _cstr(posIDorObj.css);
      me.w		= _cnum(posIDorObj.w, 0);
      me.h		= _cnum(posIDorObj.h, 0);
      me.z		= _cnum(posIDorObj.z, 0);
      me.supports = _mix({}, posIDorObj.supports || SUPPORTS_FEATURES, TRUE, TRUE, TRUE);

      if (!me.w || !me.h) {
        sz 	= _cstr(posIDorObj.size);
        if (sz) {
          sz_split	= sz.split(/x/gi);
          me.w		= _cnum(sz_split[0], 0);
          me.h		= _cnum(sz_split[1], 0);
          me.size		= sz;
        } else {
          me.size		= "";
        }
      } else {
        me.size			= me.w + "x" + me.h;
      }
    } else if (typ == "string") {
      me.id		= _cstr(posIDorObj);
      me.dest		= _cstr(posIDorObj.dest);
    } else {
      me.dest		= "";
      me.bg		= "transparent",
        me.tgt		= "_top";
      me.css		= "";
      me.w		= 0;
      me.h		= 0;
      me.size		= "";
      me.z		= 0;
      me.supports	= {};
    }

    me.id = me.id || _guid(POS_ID_AUTO_PREFIX);

    if (!config && baseConf) Config(baseConf);
    if (config) config.positions[me.id] = me;

    return _mix({}, me);
  }

  /**
   * Construct a set of dynamic key/value pairs that can be shared as meta-data with the 3rd party content inside a SafeFrame.
   * All data is treated as protected, and can only be specfied during construction of this object.
   *
   * @exports PosMeta as $sf.host.PosMeta#
   * @public
   * @constructor
   * @class
   * @param {Object} shared_object An object containing keys and values to be shared as meta-data inside the SafeFrame
   * @param {String} [owner_key] A key name to be used to hold pseudo private keys / values of meta data.
   * @param {Object} [owned_obj] An object containing psuedo private keys and values to be shared as meta-data inside the SafeFrame.
   * @example
   * var shared_data 		 = {content_id:8978098,partner_id:99},
   *     private_data_key	 = "rmx",
   * 	   private_data      = {section_id:2342,site_id:23904},
   *     meta_data		 = new $sf.host.PosMeta(shared_data, private_data_key, private_data);
   *
   * //show section id on host side
   * alert(meta_data.value("rmx", "site_id")); //== 23904
   *
   * @example
   * //now retrieve this information inside the safe frame
   *
   * var content_id = $sf.vend.meta("content_id"); //== 8978098
   *
   * var rmx_section_id = $sf.vend.meta("rmx", "section_id") //== 2342, but note that vendor side code must know the "owner_key" upfront.
   *
   */

  function PosMeta(shared_obj, owner_key, owned_obj)
  {

    var me = this, shared, non_shared, old, posConf;

    if (!(me instanceof PosMeta)) return new PosMeta(key,owned_obj,pos,shared_obj);


    shared 		= {};
    non_shared	= {};

    if (!owner_key || typeof owner_key != STR) return me;

    if (shared_obj && typeof shared_obj == OBJ) shared = _mix(shared, shared_obj);

    if (owned_obj && typeof owned_obj == OBJ) non_shared[owner_key] = owned_obj;


    /**
     * A method retrieves a meta data value from this object.
     *
     * @exports get_value as $sf.host.PosMeta#value
     * @param {String} propKey The name of the value to retrieve
     * @param {String} [owner_key] The name of the owner key of the meta data value. By default, it is assumed to be shared, so nothing needs to be passed in unless looking for a specific proprietary value
     * @return {String|Number|Boolean}
     * @default {String} ""
     * @public
     * @function
     *
     */
    function get_value(propKey, owner_key)
    {
      var ret = "";
      if (!propKey || typeof propKey != STR) return ret;
      if (!owner_key || typeof owner_key != STR) owner_key = "shared";

      if (owner_key == "shared") {
        ret = shared[propKey] || "";
      } else {
        ret = (propKey in non_shared) ? (non_shared[prop_key] || "") : "";
      }
      return ret;
    }

    /**
     * Return a serialized string representation (in url query string format) of the meta data object
     *
     * @exports serialize as $sf.host.PosMeta#toString
     * @function
     * @public
     *
     */

    function serialize()
    {
      var obj 			= new ParamHash();
      obj.shared		= shared;
      obj.non_shared	= non_shared;

      return obj.toString();
    }

    me.toString = serialize;
    me.value	= get_value;

  }


  /**
   * Create the HTML markup for a position if a src property was used
   *
   * @name $sf.host-_create_pos_markup
   * @function
   * @private
   * @static
   * @return {String}
   *
   */

  function _create_pos_markup(src)
  {
    if (src) {
      // TODO: Macro expansion within src url
      // Spec section 4.6
      // $(sf_ver}
      // $(ck_on}
      // $(flash_ver}
      if(src.indexOf("${sf_ver}") > -1){
        src = src.replace(/\${sf_ver}/gi, $sf.ver);
      }
      if(src.indexOf("${ck_on}") > -1){
        var ckVal = _cookies_enabled_test() ? '1' : '0';
        src = src.replace(/\${ck_on}/gi, ckVal);
      }
      if(src.indexOf("${flash_ver}") > -1){
        var fVer = _get_flash_version();
        src = src.replace(/\${flash_ver}/gi, fVer);
      }


    }

    return _cstr(["<scr","ipt type='text/javascript', src='", src, "'></scr", "ipt>"]);
  }

  /**
   * Get the falsh version number
   */
  function _get_flash_version(){
    if(flash_ver !== NULL){
      return flash_ver;
    }

    if(navigator.plugins && navigator.plugins.length>0){
      var mimeTypes = navigator.mimeTypes;
      if(mimeTypes && mimeTypes[FLASH_MIME] && mimeTypes[FLASH_MIME].enabledPlugin && mimeTypes[FLASH_MIME].enabledPlugin.description){
        flash_ver = mimeTypes[FLASH_MIME].enabledPlugin.version;
      }
    }
    else if(sf.env.isIE){
      // ActiveX detect
      var i, obj, tmpVer, p;
      for(i=0; i < flashActiveXVersions.length; i++){
        try{
          obj = new ActiveXObject(flashActiveXVersions[i]);
          tmpVer = obj.GetVariable("$version");
          p = tmpVer.indexOf(' ');
          if(p > -1){
            flash_ver = tmpVer.substr(p+1).replace(/,/gi, ".");;
          }
          else{
            flash_ver = tmpVer.replace(/,/gi, ".");
          }
          break;
          // "WIN 11,3,378,5"
        }catch(err){
          obj = NULL;
          flash_ver = 0;
          continue;
        }
      }
    }
    else{
      flash_ver = 0;
    }

    return flash_ver;

    var getActiveXVersion = function(activeXObj){
      var version = -1;
      try{
        version = activeXObj.GetVariable("$version");
      }catch(err){}
      return version;
    };
  }

  /**
   * Test to see if cookies are enabled
   */
  function _cookies_enabled_test()
  {
    var cookieEnabled = (navigator.cookieEnabled) ? true : false;

    if (typeof navigator.cookieEnabled == "undefined" && !cookieEnabled)
    {
      document.cookie="testcookie";
      cookieEnabled = (document.cookie.indexOf("testcookie") != -1) ? true : false;
      if(navigator){
        navigator.cookieEnabled = cookieEnabled;
      }
    }
    return (cookieEnabled);
  }

  /**
   * Construction a postion content object that contains HTML, optionally meta-data, and optionally a position configuration to use.
   * The id specified must match an id for a $sf.host.PosConfig (although said config could be specfied directly here via arguments).
   *
   * @name $sf.host.Position
   * @constructor
   * @public
   * @param {Object|String} posIDorObj The id of the position which maps to its configuration, or an object represeting the various values of an $sf.host.Position instance.
   * @param {String} [posIDorObj.id] The id of the position which maps to its configuration.
   * @param {String} [posIDorObj.html] The HTML content to be rendered inside the SafeFrame. Note that HTML strings which have SCRIPT tags or other special characters may need to be properly escaped in order to avoid JavaScript syntax errors.
   * @param {String} [posIDorObj.src] An optional URL to be used for redering inside the SafeFrame which will automatically generate a SCRIPT tag with the specified URL.
   * @param {$sf.host.PosMeta} [posIDorObj.meta] An optional instance of the $sf.host.PosMeta object to be passed along into the SafeFrame
   * @param {Object} [posIDorObj.conf] An optional representation of an $sf.host.PosConfig object to be used as the configuration for the SafeFrame position.
   * @param {String} [html] The HTML content to be rendered inside the SafeFrame. Note that HTML strings which have SCRIPT tags or other special characters may need to be properly escaped in order to avoid JavaScript syntax errors.
   * @param {$sf.host.PosMeta} [meta] An optional instance of the $sf.host.PosMeta object to be passed along into the SafeFrame
   * @param {Object} [conf] An optional representation of an $sf.host.PosConfig object to be used as the configuration for the SafeFrame position.
   *
   */

  /*
   * This is a data objet constructor, and we don't want dom interactions placed inside here
   *
  */
  function Position(posIDorObj, html, meta, conf)
  {
    var me 	= this,
      typ = (posIDorObj && typeof posIDorObj),
      origHtml = html,
      id;

    // the reason for this check is so that some one doesn't have to do "new $sf.host.Position", they
    // can just do "$sf.host.Position"

    if (!(me instanceof Position)) return new Position(posIDorObj, html, meta, conf);

    // Insure config is initialized
    if(config == null){
      var msg = "Publisher Config not initialized - abort";
      logger.error(msg);
      info.errs.push(msg);
      return;
    }

    if (typ == OBJ) {
      _mix(me, posIDorObj);
    } else {
      id = me.id = _cstr(posIDorObj) || _guid(POS_ID_AUTO_PREFIX);
    }

    if (!html) {
      if (me.src) {
        me.html = _create_pos_markup(me.src);
      } else {
        me.html = me.html || "";
        me.src	= "";
      }
    } else {
      me.html	= html;
      me.src	= "";
    }

    if (!me.html) me.html		= "";

    me.meta = meta || me.meta || {};
    me.conf = conf || me.conf || {};

    if (id) {
      if (config && config.positions[id]) {
        me.conf = config.positions[id];
      } else {
        if (conf) {
          conf.id	= id;
          me.conf = new PosConfig(conf);
        }
      }
    }
  }

  /* --END-SafeFrames publisher data class definitions */


  /* --BEGIN--SafeFrames publisher side dom helper functions */
  /* removed the concept of needing a "host" file and put all that logic to keep the file sturcture simple */

  /**
   * @namespace $sf.lib.dom.msghost Contains functionality to reside in the top level page for sending and receiving x-domain messages to SafeFrame containers
   * @name $sf.lib.dom.msghost
   *
   */

  /**
   * Returns the root document HTMLElement / node
   * @name $sf.lib.dom-_docNode
   * @private
   * @static
   * @function
   * @param {HTMLElement} [el] An HTMLElement to use as a reference for finding the root document element.
   * @returns {HTMLElement}
   *
   */

  function _docNode(el)
  {
    var d			= (el && _doc(el)) || dc,
      compatMode	= d[COMPAT_MODE],
      root		= d[DOC_EL];

    if (compatMode && !operaVer && compatMode != 'CSS1Compat')
      root = d.body;

    return root;
  }

  /**
   * Returns whether or not a value is specified in pixels
   * @name $sf.lib.dom-_isPX
   * @private
   * @static
   * @function
   * @param {String} val A css value of size
   * @returns {Boolean}
   *
   */

  function _isPX(val)
  {
    val = _cstr(val);
    if (val && val.search(/\D+/g) == -1) return TRUE;
    if (val && val.search(/px/gi) != -1) return TRUE;
  }

  /**
   * Return an array of values of clipping region information. Array represents top, right, bottom, left values respectively.
   * If values are not specified in pixels, or no clip region is defined for that element, -1 is returned for each value.
   *
   * @name $sf.lib.dom-_getClip
   * @private
   * @function
   * @static
   * @param {HTMLStyleObject} curSt The current style object of an HTMLElement
   * @return {Array}
   *
   */

  function _getClip(curSt)
  {
    var ret = [-1,-1,-1,-1], props = [CLIP+"Top",CLIP+"Right",CLIP+"Bottom",CLIP+"Left"],
      idx = 0, clipVal, prop, val, len;

    if (!curSt) return ret;

    if (ieVer) {
      while (prop = props[idx])
      {
        clipVal = curSt[prop];
        if (_isPX(clipVal)) {
          clipVal	= _cnum(clipVal,-1);
          if (clipVal >= 0) ret[idx] = clipVal;
        }
        idx++;
      }
    } else {
      clipVal = curSt[CLIP];
      if (clipVal && clipVal.search(/\d+/g) != -1) {
        clipVal		= clipVal.replace(/\w+\(([^\)]*?)\)/g, "$1");
        ret			= clipVal.split(" ");
        ret			= (ret[LEN] <= 1) ? ret.split(",") : ret;
        len			= ret[LEN];
        idx			= 0;
        while (len--)
        {
          val = ret[idx];
          if (!_isPX(val)) {
            ret[idx] = -1;
          } else {
            ret[idx] = _cnum(val,-1);
          }
          idx++;
        }
      }
    }

    return ret;
  }


  /**
   * Returns border values in pixels if possible to help calculate geometry of an element
   *
   * @name $sf.lib.dom-_calcBorders
   * @private
   * @static
   * @function
   * @param {HTMLElement} el The HTMLElement for which to look at. . .
   * @param {Object} rect The rect object generated for the HTMLElement in question to be adjusted
   * @returns {Object} rect
   *
   */

  function _calcBorders(el, rect)
  {
    var t = 0, l = 0, st, re = /^t(?:able|d|h|r|head|foot)$/i;

    st 	= currentStyle(el);
    if (st) {
      t 	= st["borderTopWidth"]
      l 	= st["borderLeftWidth"];
      t = (_isPX(t)) ? _cnum(t,0) : 0;
      l = (_isPX(l)) ? _cnum(l,0) : 0;

      if (geckVer && re.test(_tagName(el))) //getBrowserVersion should already be called since this method is only called from getRectNonIE
        t = l = 0;
    }
    rect = rect || {t:0,l:0};

    rect.t += t;
    rect.l += l;
    return rect;
  }

  /**
   * Retrieve scroll values of a document
   *
   * @name $sf.lib.dom-_get_doc_scroll
   * @private
   * @static
   * @function
   * @param {HTMLElement} [el] An HTMLElement to use as a reference document rather than the default main document
   * @return {Object} Contains x, y, w, h properties for scrolling
   *
   */

  function _get_doc_scroll(el)
  {
    var pos = {x:0,y:0,w:0,h:0}, def = {scrollLeft:0,scrollTop:0,scrollWidth:0,scrollHeight:0}, d, de, dv, db, offsetX = 0, offsetY = 0;

    d		= _doc(el) || dc;
    de		= d[DOC_EL] || def;
    db		= d.body || def;
    dv 		= d.defaultView; //only for non-ie
    if (dv) {
      offsetX	= _cnum(dv.pageXOffset,0);
      offsetY	= _cnum(dv.pageYOffset,0);
    }
    pos.x = _max(de.scrollLeft, db.scrollLeft, offsetX);
    pos.y = _max(de.scrollTop, db.scrollTop, offsetY);
    pos.w = _max(de.scrollWidth, db.scrollWidth, 0);
    pos.h = _max(de.scrollHeight, db.scrollHeight,0);
    return pos;
  }

  /**
   * Calculate a geometric rectangle for a given element. Note that for IE browsers
   * we can use the "getBoundingClientRect" function which saves us some time / increases
   * peformance. . however it really can only be called if the DOM is completely loaded,
   * and if that is the case we fallback to the brute-force / non-IE method.
   *
   * @name $sf.lib.dom-_getRectIE
   * @private
   * @static
   * @function
   * @param {HTMLElement} el  The element for which to derive a rectangle object
   * @returns {Object} An object representing the rectangle for the given HTMLElement
   *
   */

  function _getRectIE(el)
  {
    var rect 	= {t:0,l:0,r:0,b:0,w:0,h:0,z:0},
      _back 	= "BackCompat",
      scroll, box, d, de, compatMode,st,
      adjustX, adjustY, bLeft, bTop;

    if (el && el[NODE_TYPE] == 1) {
      try {
        d			= _doc(el) || dc;
        if (!dom.ready()) return _getRectNonIE(el);

        scroll 		= _get_doc_scroll(el);
        box			= el.getBoundingClientRect();
        rect.t		= box.top;
        rect.l		= box.left;

        adjustX		=
          adjustY 	= IE_BORDER_ADJ;
        compatMode	= d[COMPAT_MODE];
        de			= d[DOC_EL];
        st			= currentStyle(de);
        bLeft		= st["borderLeftWidth"];
        bTop		= st["borderTopWidth"];

        if (ieVer === 6) {
          if (compatMode != _back) {
            adjustX =
              adjustY = 0;
          }
        }
        if (compatMode == _back) {
          bLeft 	= (_isPX(bLeft)) ? _cnum(bLeft,0) : 0;
          adjustX	= bLeft;
          bTop	= (_isPX(bTop)) ? _cnum(bTop,0) : 0;
          adjustY = bTop;
          rect.t -= adjustX;
          rect.l -= adjustY;
        }
        rect.t += scroll.y;
        rect.l += scroll.x;
        rect.b = rect.t + el.offsetHeight;
        rect.r = rect.l + el.offsetWidth;
        rect.w = _max((rect.r-rect.l),0);
        rect.h = _max((rect.b-rect.t),0);
        rect.z = currentStyle(el, "zIndex");
      } catch (e) {
        rect = {t:0,l:0,r:0,b:0,w:0,h:0,z:0};
      }
    }
    return rect;
  }

  /**
   * Calculate a geometric rectangle for a given element. For non-IE browsers, we must use
   * brute-force and walk up the offsetParent tree. Also takes in consideration for some
   * other slight variations in browsers.
   *
   * @name $sf.lib.dom-_getRectNonIE
   * @private
   * @static
   * @function
   * @param {HTMLElement} el  The element for which to derive a rectangle object
   * @returns {Object} An object representing the rectangle for the given HTMLElement
   *
   */

  function _getRectNonIE(el)
  {
    var rect		= {t:0,l:0,r:0,b:0,w:0,h:0,z:0},
      scrollTop	= 0,
      scrollLeft	= 0,
      bCheck		= FALSE,
      root		= _docNode(el),
      scroll 		= _get_doc_scroll(el),
      parentNode, w, h;

    if (el && el[NODE_TYPE] == 1) {
      try {
        rect.l		= el.offsetLeft || 0;
        rect.t		= el.offsetTop || 0;
        parentNode	= el;

        bCheck	= (geckVer || wbVer > 519);

        while (parentNode = parentNode.offsetParent)
        {
          rect.t += parentNode.offsetTop || 0;
          rect.l += parentNode.offsetLeft || 0;
          if (bCheck)
            _calcBorders(parentNode, rect);

          if (parentNode == root) break;
        }

        parentNode = el;

        if (currentStyle(parentNode, "position")  != "fixed") {
          parentNode = el;

          while (parentNode = _par(parentNode))
          {
            if (parentNode[NODE_TYPE] == 1) {
              scrollTop 	= parentNode.scrollTop || 0;
              scrollLeft 	= parentNode.scrollLeft || 0;

              //Firefox does something funky with borders when overflow is not visible.
              if (geckVer && currentStyle(parentNode, OVER) != "visible")
                _calcBorders(parentNode, rect);

              rect.l -= scrollLeft;
              rect.t -= scrollTop;
            }
            if (parentNode == root) break;
          }

          rect.t += scroll.y;
          rect.l += scroll.x;
        } else {
          rect.t += scroll.y;
          rect.l += scroll.x;
        }
        if (!ieVer && el == _docNode(el)) {
          h = el.clientHeight;
          w = el.clientWidth;
        } else {
          h = el.offsetHeight;
          w = el.offsetWidth;
        }

        rect.b = rect.t + h;
        rect.r = rect.l + w;
        rect.w = _max((rect.r-rect.l), 0);
        rect.h = _max((rect.b-rect.t), 0);
        rect.z = currentStyle(el, "zIndex");
      } catch (e) {
        rect = {t:0,l:0,r:0,b:0,w:0,h:0,z:0};
      }
    }

    return rect;
  }

  /**
   * Returns an object that represents a rectangle with the geometric information of an HTMLDocument
   * (includes scroll width / height)
   *
   * @name $sf.lib.dom.docRect
   * @public
   * @static
   * @function
   * @param {HTMLElement} [el] An HTMLElement to use as the reference for an HTMLDocument
   * @returns {Object}
   *
   */

  function docRect(el)
  {
    var root	= _docNode(el),
      w		= 0,
      h		= 0;

    if (root) {
      w	= root.scrollWidth || 0;
      h	= root.scrollHeight || 0;
    }
    return {t:0,l:0,b:h,r:w,w:w,h:h};
  }

  /**
   * Returns an object that represents a rectangle with the geometric information of an HTMLWindow
   * (does not include scroll width / height)
   *
   * @name $sf.lib.dom.winRect
   * @public
   * @static
   * @function
   * @param {HTMLElement} [el] An HTMLElement to use as the references for an HTMLWindow
   * @returns {Object}
   *
   */

  function winRect(el)
  {
    var wi		= (el && _view(el)) || win,
      h		= wi.innerHeight || 0,
      w		= wi.innerWidth || 0,
      t		= wi.screenY || wi.screenTop || 0,
      b		= h+t,
      l		= wi.screenX || wi.screenLeft || 0,
      r		= w+l,
      root	= _docNode(el);

    if (!h && !w && root) {
      h = root.clientHeight || 0;
      w = root.clientWidth || 0;
      r = l+w;
      b = t+h;
    }
    return {t:t,l:l,b:b,r:r,w:w,h:h};
  }

  /**
   * Returns whether or not an HTMLElement is contained within another HTMLElement
   *
   * @name $sf.lib.dom.contains
   * @public
   * @static
   * @function
   * @param {HTMLElement} element The HTMLElement reference to search within
   * @param {HTMLElement} needle The HTMLElement for which you want to check if its contained by the 1st parameter
   * @returns {Boolean}
   *
   */

  function contains(element, needle)
  {
    var ret = FALSE, el_node_type = ((element && element[NODE_TYPE]) || -1), needle_node_type = ((needle && needle[NODE_TYPE]) || -1);

    if (el_node_type == 1 && needle_node_type != -1) {
      if (element[CONTAINS]) {
        if (operaVer || needle_node_type == 1) {
          ret = element[CONTAINS](needle);
        } else {
          while (needle)
          {
            if (element === needle) {
              ret = TRUE;
              break;
            }
            needle = needle.parentNode;
          }
        }
      } else if (element[COMPARE_DOC_POS]) {
        ret = (element === needle || !!(element[COMPARE_DOC_POS](needle) & 16));
      }
    }
    return ret;
  }

  /**
   * Returns the current value of a style attribute, or the current style object in its entirety depending on whether an attribute parameter is specified
   *
   * @name $sf.lib.dom.currentStyle
   * @public
   * @static
   * @function
   * @param {HTMLElement} el The HTMLElement for which to retrieve style information
   * @param {String} [attr] The style attribute (in JavaScript notation, e.g. 'backgroundColor' rather than 'background-color') to fetch.
   * @return {HTMLStyleObject} An HTMLStyleObject containing all current style attribute values
   * @return {String} The value of an style attribute (only if attr parameter is specified).
   *
   */

  function currentStyle(el, attr)
  {
    var val = "", hasAttr = !!(arguments[LEN] && attr), comp = "getComputedStyle", e;

    if (hasAttr) {
      if (ieVer) {
        try {
          val = el.currentStyle[attr];
        } catch (e) {
          val = "";
        }
      } else {
        try {
          val = _view(el)[comp](el,NULL)[attr];
        } catch (e) {
          val = "";
        }
      }
    } else {
      if (ieVer) {
        try {
          val = el.currentStyle;
        } catch (e) {
          val = NULL;
        }
      } else {
        try {
          val = _view(el)[comp](el,NULL);
        } catch (e) {
          val = NULL;
        }
      }
    }
    return val;
  }

  /**
   * Calculate the surrounding boundaries of an HTMLElement, and whether or not the HTMLElement is "in-view" of the user
   *
   * @name $sf.lib.dom.bounds
   * @public
   * @static
   * @function
   * @param {HTMLElement} el The element for which to calculate information
   * @param {Object} [details] An object reference used as an output parameter in which further details about the boundaries of the element are specified
   * @param {Boolean} [check_3D] Check the element within 3 dimensional space such that any elements covering said element are also take into consideration
   * @returns {Object} info An object containing information about the element boundaries
   *
   */

  function bounds(el, details, check_3D)
  {
    var par					= el && _par(el),
      root				= _docNode(el),
      el_rect				= _rect(el),
      root_rect			= _rect(root),
      root_scroll			= _get_doc_scroll(root),
      doc_rect			= docRect(el),
      clip_rect			= {t:0,l:0,r:0,b:0,w:0,h:0},
      exp_rect			= {t:0,l:0,r:0,b:0,xs:0,ys:0,xiv:0,yiv:0,iv:0,w:0,h:0},
      xsb_h				= 0,
      ysb_w				= 0,
      is_scroll_node		= FALSE,
      is_using_doc_root_r	= FALSE,
      is_using_doc_root_b	= FALSE,
      cur_st, w, h, t, l, r, b, scroll_width, offset_width, client_width,
      scroll_height, offset_height, client_height,over_x_val, scroll_left, scroll_top,
      over_y_val, clip, x_hidden, y_hidden, ref_node, temp_rect, is_scroll_node = FALSE;

    details = (details && typeof details == OBJ) ? details : {};

    if (par) {
      /*
       * Here we are looping through parent nodes to check if any of them have clip / overflow
       * settings which would create a new boundary point (as opposed to the body of the document)
       *
       * Ideally I would have liked to break the logic out that finds said reference node, away
       * from the calculation part. . however during optimization phases, it was quick to store
       * off variables for from dom properties for width / height
       *
      */

      while (cur_st = currentStyle(par))
      {
        if (cur_st["display"] == "block" ||
          cur_st["position"] == "absolute" ||
          cur_st["float"] != "none" ||
          cur_st["clear"] != "none") {
          over_x_val		= cur_st[OVER+"X"];
          over_y_val		= cur_st[OVER+"Y"];
          clip			= _getClip(cur_st);
          if (par == root) {
            scroll_width	= root_scroll.w;
            scroll_height	= root_scroll.h;
          } else {
            scroll_width	= par.scrollWidth;
            scroll_height	= par.scrollHeight;
          }
          offset_width	= par.offsetWidth;
          offset_height	= par.offsetHeight;
          client_width	= par.clientWidth;
          client_height	= par.clientHeight;

          if (over_x_val == HIDDEN || clip[1] > 0 || clip[3] > 0) {
            if (!ref_node) {
              x_hidden = 1;
              ref_node = par;
            }
          }

          if (over_y_val == HIDDEN || clip[0] > 0 || clip[2] > 0) {
            if (!ref_node) {
              y_hidden = 1;
              ref_node = par;
            }
          }

          if (over_x_val == SCROLL) {
            ref_node 		= par;
            xsb_h 			= offset_height-client_height;
            is_scroll_node	= TRUE;
          }

          if (over_y_val == SCROLL) {
            if (!ref_node) ref_node = par;
            ysb_w = offset_width-client_width;
            is_scroll_node	= TRUE;
          }

          if (over_x_val == AUTO) {
            if (!ref_node) ref_node = par;
            if (scroll_width > client_width) {
              //scrolling is on
              xsb_h = offset_height - client_height;
            }
            is_scroll_node	= TRUE;
          }
          if (over_y_val == AUTO) {
            if (!ref_node) ref_node = par;
            if (scroll_height > client_height) {
              ysb_w = offset_width - client_width;
            }
            is_scroll_node	= TRUE;
          }

          if (ref_node) break;
        }
        if (par == root) {
          if (scroll_width > client_width) {
            //scrolling is on
            h	  = (win.innerHeight || 0) || offset_height;
            xsb_h = h - client_height;
          }
          if (scroll_height > client_height) {
            w	  = (win.innerWidth || 0) || offset_width;
            ysb_w = w - client_width;
          }
          is_scroll_node	= TRUE;
        }
        par = _par(par);
        if (!par || par[NODE_TYPE] != 1) break;
      }
    }

    if (el_rect.w && el_rect.h) {
      /*
       * Now look at the element dimensions vs the ref node dimensions
       *
      */

      if (!ref_node || ref_node == root) {

        /*
         * if ref node is the root node we need a bit of special processing
         *
        */

        exp_rect.t	= _max(el_rect.t, 0);
        exp_rect.l	= _max(el_rect.l, 0);

        if (ieVer && dc[COMPAT_MODE] == "BackCompat" && _attr(root,SCROLL) == "no") {
          y_hidden = x_hidden = 1;
        } else {
          cur_st		= currentStyle(root);
          if (cur_st) {
            x_hidden	= (cur_st[OVER+"X"] == HIDDEN);
            y_hidden	= (cur_st[OVER+"Y"] == HIDDEN);
          }
        }

        if (root_scroll.h > root.clientHeight) {
          if (y_hidden) {
            exp_rect.b	= 0;
          } else {
            is_using_doc_root_b	= TRUE;
            exp_rect.b			= _max( ((doc_rect.h-el_rect.h)-xsb_h)-el_rect.t, 0);
          }
        } else {
          exp_rect.b	= _max( ((root_rect.h-el_rect.h)-xsb_h)-el_rect.t, 0);
        }

        if (root_scroll.w > root.clientWidth) {
          if (x_hidden) {
            exp_rect.r	= 0;
          } else {
            is_using_doc_root_r	= TRUE;
            exp_rect.r			= _max( ((doc_rect.w-el_rect.w)-ysb_w)-el_rect.l, 0);
          }
        } else {
          exp_rect.r	= _max( ((root_rect.r-el_rect.w)-ysb_w)-el_rect.l, 0);
        }


      } else {
        cur_st		= currentStyle(ref_node);

        /* In standards mode, body's offset and client numbers will == scroll numbers which is not what we want */
        if (_tagName(ref_node) == "body") {
          ref_node = root;
          t		 = el_rect.t;
          l		 = el_rect.l;
        } else {
          t = l = 0;
        }

        clip_rect	= _rect(ref_node);

        if (clip[1] > 0) {
          clip_rect.w = clip[1];
          clip_rect.r = clip_rect.l + clip_rect.w;
        }
        if (clip[3] > 0) {
          clip_rect.l = clip_rect.l+clip[3];
          clip_rect.w = clip_rect.w-clip[3];
        }

        if (clip[2] > 0) {
          clip_rect.h	= clip[2];
          clip_rect.b = clip_rect.t + clip_rect.h;
        }

        if (clip[0] > 0) {
          clip_rect.t = clip_rect.t+clip[0];
          clip_rect.h = clip_rect.h-clip[0];
        }

        if (el_rect.t > clip_rect.t && clip_rect.t > 0)  t = el_rect.t-clip_rect.t;
        if (el_rect.l > clip_rect.l && clip_rect.l > 0)  l = el_rect.l-clip_rect.l;

        scroll_top		= ref_node.scrollTop;
        scroll_left		= ref_node.scrollLeft;
        scroll_height	= ref_node.scrollHeight;
        scroll_width	= ref_node.scrollWidth;

        exp_rect.t	= _max(t,0);
        exp_rect.l	= _max(l,0);

        if (cur_st) {
          x_hidden	= (cur_st[OVER+"X"] == HIDDEN || clip[1] > 0 || clip[3] > 0);
          y_hidden	= (cur_st[OVER+"Y"] == HIDDEN || clip[0] > 0 || clip[2] > 0);
        }

        if (el_rect.t >= clip_rect.b) {
          exp_rect.b = 0;
        } else {
          if (!y_hidden && el_rect.t >= clip_rect.b) y_hidden = 1;

          if (scroll_height > ref_node.clientHeight) {
            if (y_hidden) {
              exp_rect.b = 0;
            } else {
              exp_rect.b	= _max( ((scroll_height-el_rect.h)-xsb_h)-t, 0);
            }
          } else {
            exp_rect.b	= _max( ((clip_rect.h-el_rect.h)-xsb_h)-t, 0);
          }
        }

        if (el_rect.l >= clip_rect.r) {
          exp_rect.r = 0;
        } else {
          if (!x_hidden && el_rect.l >= clip_rect.r) x_hidden = 1;

          if (scroll_width > ref_node.clientWidth) {
            if (x_hidden) {
              exp_rect.r = 0;
            } else {
              exp_rect.r	= _max( ((scroll_width-el_rect.w)-ysb_w)-l, 0);
            }
          } else {
            exp_rect.r	= _max( ((clip_rect.w-el_rect.w)-ysb_w)-l, 0);
          }
        }
      }

      exp_rect.xs			= (xsb_h)?1:0;
      exp_rect.ys			= (ysb_w)?1:0;
      exp_rect.w			= exp_rect.r+exp_rect.l;
      exp_rect.h			= exp_rect.t+exp_rect.b;

      if (!ref_node || ref_node == root) {
        temp_rect = root_rect;
        ref_node  = root;
      } else {
        temp_rect = clip_rect;
      }

      l = _max(el_rect.l,temp_rect.l);
      r = _min(el_rect.r,(is_using_doc_root_r) ? _min(doc_rect.r,temp_rect.r) : temp_rect.r);
      w = _max(r - l,0);
      t = _max(el_rect.t,temp_rect.t);
      b = _min(el_rect.b,(is_using_doc_root_b) ? _min(doc_rect.b,temp_rect.b) : temp_rect.b);
      h = _max(b-t,0);

      exp_rect.xiv = _cnum((w / el_rect.w)[TFXD](2));
      exp_rect.yiv = _cnum((h / el_rect.h)[TFXD](2));
      exp_rect.iv	 = _cnum(((w * h) / (el_rect.w * el_rect.h))[TFXD](2));

    }

    details.refNode 	= ref_node||root;
    details.isRoot		= (ref_node == root);
    details.canScroll	= is_scroll_node;
    details.refRect		= (!ref_node || ref_node == root) ? root_rect : clip_rect;
    details.expRect		= exp_rect;
    details.rect		= el_rect;

    if (check_3D) {
      (function() {
        var idx	= 0, len = 0, arOvrlaps, el_w, el_h, el_area, ovr_node, ovr_node_rect,
          t, b, l, r, h, w, ovr_area, new_iv, new_xiv, new_yiv;

        if (exp_rect.iv > .5) {
          mgr_bounds_details		= details;
          arOvrlaps				= overlaps(el,_cnum(check_3D,1,1));
          mgr_bounds_details		= NULL;
          len						= arOvrlaps[LEN];
          el_w					= el_rect.w;
          el_h					= el_rect.h,
            el_area					= el_w * el_h;

          if (len) {
            while (ovr_node = arOvrlaps[idx++])
            {
              ovr_node_rect 	= _rect(ovr_node);
              l				= _max(el_rect.l, ovr_node_rect.l);
              r				= _min(el_rect.r, ovr_node_rect.r);
              t				= _max(el_rect.t, ovr_node_rect.t);
              b				= _min(el_rect.b, ovr_node_rect.b);
              w				= r - l;
              h 				= b - t;
              ovr_area		= w * h;
              new_xiv			= (1 - (w / el_w))[TFXD](2);
              new_yiv			= (1 - (h / el_h))[TFXD](2);
              new_iv			= (1 - (ovr_area / el_area))[TFXD](2);

              if ((new_xiv>0 && new_xiv < exp_rect.xiv) || (new_yiv>0 && new_yiv < exp_rect.yiv)) {
                exp_rect.xiv = new_xiv;
                exp_rect.yiv = new_yiv;
                exp_rect.iv	 = new_iv;
              }
            }
          }
        }
      })();
    }

    return exp_rect;
  }


  /**
   * Find any HTMLElements that are covering a given HTMLElement.
   *
   * @name $sf.lib.dom.overlaps
   * @public
   * @static
   * @function
   * @param {HTMLElement} el The HTMLElement for which to find any other elements that may be covering it.
   * @param {Number} [limit] The maximum number of covering elements to return
   * @returns {Array} An array of elements that are covering the given element
   *
   */

  function overlaps(el,limit)
  {
    var rect 		= _rect(el),
      doc			= _doc(el),
      root		= _docNode(doc),
      t	 		= rect.t,
      l	 		= rect.l,
      w	 		= rect.r-rect.l,
      h			= rect.b-rect.t,
      factor		= INTERSECT_FACTOR,
      ret			= [],
      baseW		= _round(w / factor),
      baseH		= _round(h / factor),
      curW		= baseW,
      curH		= baseH,
      seen		= {},
      par_details	= {},
      points		= [],
      idx			= 0,
      x, y, pt, id, checkEl, ref_par_node, ref_par_rect, maxX, maxY;

    if (mgr_bounds_details) {
      par_details = mgr_bounds_details;
    } else {
      bounds(el,par_details,TRUE);
    }

    ref_par_node = par_details.refNode;
    ref_par_rect = par_details.refRect;
    if (ref_par_rect && ref_par_node && ref_par_node != root) {
      maxX = ref_par_rect.r;
      maxY = ref_par_rect.b;
    } else {
      maxX = l+w;
      maxY = t+h;
    }

    if (doc && root && doc[EL_FROM_PT]) {
      while (curW < w)
      {
        curH	= baseH;
        while (curH < h)
        {
          x		= l+curW;
          y		= t+curH;
          if (x < maxX && y < maxY) points.push([x,y]);
          curH += baseH;
        }
        curW  += baseW;
      }

      limit = _cnum(limit, points[LEN]);

      while (pt = points[idx++])
      {
        checkEl = doc[EL_FROM_PT](pt[0],pt[1]);
        try {
          if (checkEl && checkEl.nodeType == 1 && checkEl !== root && checkEl !== el && !contains(el, checkEl)) {
            id	= _attr(checkEl,"id");
            if (!id) {
              id = lang.guid("geom_inter");
              _attr(checkEl,"id",id);
            }
            if (!seen[id] && ret[LEN] < limit) {
              seen[id] = 1;
              ret.push(checkEl);
            }
          }
        } catch (e) { }
      }
    }
    id = "";
    for (id in seen)
    {
      if (id.indexOf("geom_inter") == 0) {
        checkEl = _elt(id);
        if (checkEl) _attr(checkEl,"id",NULL);
      }
    }
    return ret;
  }

  /* --END--SafeFrames publisher side dom helper functions */

  /* --BEGIN--SafeFrames publisher side dom msg host helper functions */

  /**
   * A proxy wrapper for calling into the cross-domain messaging host fall back library
   * Looks for namespace will be $sf.lib.dom.msghost_fb
   * Said library is used in cases where there is not HTML5 style messaging (i.e. no postMessage method available).
   *
   * @name $sf.lib.dom.msghost-_call_xmsg_host_fb
   * @private
   * @static
   * @function
   * @param {String} methName The method name in the msg host library to call
   * @param {*} arg1 An arbitrary argument to pass to said method as the 1st arg
   * @param {*} arg2 An arbitrary argument to pass to said method as the 2nd arg
   * @param {*} arg3 An arbitrary argument to pass to said method as the 3rd arg
   * @returns {*} whatever comes back from the method
   *
   */

  function _call_xmsg_host_fb(methName,arg1,arg2,arg3)
  {
    if (!msghostfb) msghostfb = dom.msghost_fb;

    return methName && msghostfb && msghostfb[methName] && msghostfb[methName](arg1,arg2,arg3);
  }

  /**
   * Listen for an initial HTML5 postMessage event, to validate that HTML5 style
   * messaging can be used
   *
   * @name $sf.lib.dom.msghost-_check_html5_init
   * @private
   * @static
   * @function
   * @param {HTMLEvent} evt The raw HTML event object received from the postMessage call
   *
   */

  function _check_html5_init(evt)
  {
    if (!canUseHTML5 && evt && evt.data == initID) {
      canUseHTML5	= TRUE;
      dom.evtCncl(evt);
      dom[DETACH](win, MSG, _check_html5_init);
    }
  }

  /**
   * Listen for onmessage events in the main window. Validate that message is for us, and if so
   * pass it through to the rest of the code and cancel further handling.
   *
   * @name $sf.lib.dom.msghost-_handle_msg_from_outside
   * @private
   * @static
   * @function
   * @param {HTMLEvent} evt The raw HTML event object received from the postMessage call
   *
   */

  function _handle_msg_from_outside(evt)
  {
    var data		= evt && evt.data,
      msg_win		= evt && evt.source,
      params		= data && (typeof data == 'string' && data.indexOf(GUID) != -1) && ParamHash(data),
      tgtID 		= params && params.id,
      ifr			= tgtID && _elt(tgtID),
      fr_win		= ifr && _ifr_view(ifr),
      pipe  		= tgtID && msg_pipes[tgtID],
      dataGUID	= params && params[GUID],
      pipeGUID	= pipe && pipe[GUID],
      cb			= pipe && pipe._xmsgcb,
      ret			= FALSE;

    if (pipeGUID && dataGUID && dataGUID == pipeGUID && msg_win && fr_win && fr_win == msg_win) {
      try {
        ret = cb(params.msg);
      } catch (e) {
        ret = FALSE;
      }
    }
    if (ret) dom.evtCncl(evt);
    return ret;
  }

  /**
   * Send a message to a child iframe.
   *
   * @name $sf.lib.dom.msghost.send
   * @public
   * @static
   * @function
   * @param {String} tgtID The HTML id attribute of the iframe element for which to send a message
   * @param {String} data The string of data to send to the given iframe
   * @returns {Boolean} Whether or not message was send succesfully (note that this does not mean message was handled / recevied, only that sending was ok).
   *
   */

  function send_msg_to_child_iframe(tgtID, data)
  {
    var pipe 	= tgtID && msg_pipes[tgtID],
      success = FALSE,
      msgObj, w, el, e;

    if (!pipe) {
      success = _call_xmsg_host_fb("send",tgtID, data);
    } else {
      if (pipe) {
        msgObj		= ParamHash();
        msgObj.msg	= data;
        msgObj.guid	= pipe.guid;

        if (usingHTML5()) {
          el 		= _elt(tgtID);
          w		= _ifr_view(el);
          try {
            w[PMSG](_cstr(msgObj),pipe.srcHost || "*");
            success = TRUE;
          } catch (e) {
            success = FALSE;
          }
        } else {
          success = _call_xmsg_host_fb("send", tgtID, data);
        }
      }
    }
    msgObj = w = el = NULL;
    return success;
  }

  /**
   * Get whether or not HTML5 style messaging can be used
   *
   * @name $sf.lib.dom.msghost.usingHTML5
   * @public
   * @static
   * @function
   * @returns {Boolean}
   *
   */

  function usingHTML5()
  {
    return canUseHTML5;
  }

  /**
   * Gets a location of the hosting page, stripped of the search hash,
   * but leaving query parameters, port, host, path, etc.
   *
   */
  function _strippedEncodedLocation()
  {
    var cleaned, pos = loc.href.indexOf("#");

    if (pos > -1){
      cleaned = loc.href.substr(0, pos);
    } else {
      cleaned = loc.href;
    }
    pos = cleaned.indexOf("?");
    if (pos > -1) {
      cleaned = cleaned.substr(0, pos);
    }

    return escape(cleaned);
  }


  /**
   * Prepare an iframe in the top level window to be able to send / receive cross-domain messages
   * Generally this method is called from $sf.lib.iframes.  The attrs object in question should
   * represent key/value pairs of HTML attributes for the iframe. Note that the attrs object passed
   * in will be modified with a new "name" property, to send information into the iframe and setup
   * messaging.
   *
   * @name $sf.lib.dom.msghost.prep
   * @public
   * @static
   * @function
   * @param {Object} attrs Information required to set up the cross-domain messaging channel
   * @param {String} attrs.id The IFRAME HTML id attribute
   * @param {String} attrs.src The URL / src attribute of the IFRAME
   * @param {String} [attrs.guid] The guid / signature to use to validate that messages sent/ received can be accepted. If not specified, one will be created automatically.
   * @param {String} [attrs.name] The IFRAME HTML name attribute which will be used to send an intial message to the HTML document inside the IFRAME.
   * @returns {Object} An object with various properties detailing the messaging pipe-line.
   *
   */

  function prep_iframe_msging(attrs)
  {
    var pipe = NULL, iframeName, nameParams, src, srcHost, newPipe,
      locStripped = _strippedEncodedLocation();


    if (attrs) {
      iframeName		= attrs.name;
      nameParams		= ParamHash(iframeName);
      src				= _cstr(attrs.src);
      srcHost			= src && src.substring(0, src.indexOf("/",9));
      srcHost			= (srcHost.search(/http/gi) != 0) ? "" : srcHost;
      pipe			= ParamHash(nameParams);
      pipe.id			= attrs.id || ("iframe_" + _guid());
      pipe.src		= src;
      pipe.srcHost	= srcHost;
      pipe[GUID]		= pipe[GUID] || _guid();
      pipe.host		= locHost;
      pipe.loc		= locStripped;
      pipe.proxyID	= "";

      if (usingHTML5()) {
        pipe.html5		= 1;
        pipe.proxyPath	= "";
      } else {
        newPipe			= _call_xmsg_host_fb("prep", pipe);
        if (newPipe) pipe = newPipe;
      }

      attrs.name		= pipe;
    }
    return pipe;
  }


  /**
   * Listen for messages from an IFRAME. Note that on the host / publisher side
   * this library only allows for one message handler to be attached to a given
   * IFRAME.
   *
   * @name $sf.lib.dom.msghost.attach
   * @public
   * @static
   * @function
   * @param {HTMLElement} el The IFRAME reference to attach a listener callback too. .
   * @param {Object} pipe The message pipe object created from $sf.lib.dom.msghost.prep
   * @param {Function} cb The callback function to fire when a message is received
   *
   */

  function attach_iframe_msging(el,pipe,cb)
  {
    var tgtID;

    if (_tagName(el) == "iframe") {
      tgtID 	= _attr(el,"id");
      if (tgtID && pipe && (pipe instanceof ParamHash) && tgtID == pipe.id) {
        if (usingHTML5()) {
          msg_pipes[tgtID]	= pipe;
          pipe._xmsgcb		= cb;
          if (!html5Bound) {
            dom[ATTACH](win, MSG, _handle_msg_from_outside);
            html5Bound = TRUE;
          }
        } else {
          _call_xmsg_host_fb(ATTACH,el,pipe,cb);
        }
      }
    }
  }


  /**
   * Detach listening for messages from an IFRAME
   *
   * @name $sf.lib.dom.msghost.detach
   * @public
   * @static
   * @function
   * @param {HTMLElement} el The IFRAME reference to detach a listener
   *
   */

  function detach_iframe_msging(el)
  {
    var id		= _attr(el,"id"),
      pipe	= id && msg_pipes[id],
      w		= NULL,
      empty	= TRUE;

    if (!pipe) {
      _call_xmsg_host_fb(DETACH,el);
      return;
    }
    if (pipe) {
      pipe._xmsgcb	 =
        msg_pipes[id] 	 = NULL;
      pipe			 = NULL;
      delete msg_pipes[id];
    }
    id	= "";
    for (id in msg_pipes)
    {
      pipe = msg_pipes[id];
      if (pipe && pipe[GUID]) {
        empty = FALSE;
        break;
      }
    }
    if (empty && usingHTML5() && html5Bound) {
      html5Bound	= FALSE;
      dom[DETACH](win, MSG, _handle_msg_from_outside);
    }

    el = w = pipe = NULL;
  }

  /* --END--SafeFrames publisher side dom msg host helper functions */


  /**
   * Fire the specifed callback out to the publisher. Note that other arguments beyond the 1st argument are passed throug to the callback.
   *
   * @name $sf.host-_fire_pub_callback
   * @static
   * @private
   * @function
   * @param {String} cb_name The callback name to fire
   *
   */

  function _fire_pub_callback(cb_name /* args to call back */)
  {
    var cb_args = [], args = arguments, len = args[LEN],
      idx = 0, f,
      ret = FALSE,
      e, a;

    if (config) {
      f	= config[cb_name];
      if (f) {
        while (len--)
        {
          a = args[idx++];
          if(a != cb_name){
            cb_args.push(a);
          }
        }
        try {
          ret = f.apply(NULL,cb_args);
        } catch (e) {
          ret = FALSE;
        }
      }
    }
    return ret;  //ADDED BY SEAN
  }

  /**
   * Nuke the position an report that said position took too long to render
   *
   * @name $sf.host-_handle_render_timeout
   * @static
   * @private
   * @function
   * @param {String} pos_id The position id that has taken too long
   *
   */

  function _handle_render_timeout(pos_id)
  {
    var pend = pos_id && pending_ifrs[pos_id];
    if (pend) {
      clearTimeout(pend);
      nuke(pos_id);
      _fire_pub_callback(POS_MSG, "render-timeout", pos_id);
    }
    if (!_has_pending_renders()) current_status = "";
  }


  /**
   * Clear the timer that fires every so often to update the geometry in side
   * of SafeFrames
   *
   * @name $sf.host-_clear_geom_update_timer
   * @static
   * @private
   * @function
   *
   */
  function _clear_geom_update_timer()
  {
    if (geom_update_timer) {
      clearTimeout(geom_update_timer);
      geom_update_timer = 0;
    }
  }

  /**
   * Clear the timer that fires every so often to update the geometry in side
   * of SafeFrames
   *
   * @name $sf.host-_clear_geom_update_timer
   * @static
   * @private
   * @function
   *
   */
  function _clear_focus_update_timer()
  {
    if (focus_update_timer) {
      clearTimeout(focus_update_timer);
      focus_update_timer = 0;
    }
  }

  /**
   * Set up the timer function that updates each SafeFrame with up to date geometric information
   *
   * @name $sf.host-_set_geom_update_timer
   * @static
   * @private
   * @function
   *
   */
  function _set_focus_update_timer(in_focus)
  {
    _clear_focus_update_timer();
    focus_update_timer = setTimeout(function() { _update_focus(in_focus); }, 2);
  }

  /**
   * Set up the timer function that updates each SafeFrame with up to date geometric information
   *
   * @name $sf.host-_set_geom_update_timer
   * @static
   * @private
   * @function
   *
   */
  function _set_geom_update_timer(is_win_scroll)
  {
    _clear_geom_update_timer();
    if (is_win_scroll) {
      geom_update_timer = setTimeout(_update_geom_win_scroll, GEOM_UPDATE_INTRVAL);
    } else {
      geom_update_timer = setTimeout(_update_geom_win_resize, GEOM_UPDATE_INTRVAL);
    }
  }

  /**
   * Update all SafeFrames with updated geometric information
   *
   * @name $sf.host-_update_geom
   * @static
   * @private
   * @function
   * @param {Boolean} is_win_scroll Whether or not we are updating due to the main window being scrolled
   *
   */

  function _update_geom(is_win_scroll)
  {
    var posID, params, msgObj, id, ifr, g;
    for (posID in rendered_ifrs)
    {
      if (is_win_scroll && (posID in scroll_parents_attached)) continue;

      params 			= rendered_ifrs[posID];
      id				= (params && params.dest);
      ifr				= (id && _elt(id));
      if (ifr && params) {
        g				= _build_geom(posID, ifr, TRUE);
        msgObj			= ParamHash();
        msgObj.pos		= posID;
        msgObj.cmd		= NOTIFY_GEOM_UPDATE;
        msgObj.geom		= _es(g);

        _fire_pub_callback(POS_MSG, posID, NOTIFY_GEOM_UPDATE, g);
        _send_response(params, msgObj);
      }
    }
    _clear_geom_update_timer();
  }

  /**
   * Update all SafeFrames with updated geometric information due to a window resize
   * event.
   *
   * @name $sf.host-_update_geom_win_resize
   * @static
   * @private
   * @function
   *
   */
  function _update_geom_win_resize()
  {
    _update_geom();
  }

  /**
   * Update all SafeFrames with updated geometric information due to a window scroll event
   *
   * @name $sf.host-_update_geom_win_scroll
   * @static
   * @private
   * @function
   *
   */

  function _update_geom_win_scroll()
  {
    _update_geom(TRUE);
  }


  /**
   * Update a SafeFrame that has new geometric information due to its parent HTML element
   * scrolling.
   *
   * @name $sf.host-_handle_node_scroll
   * @static
   * @private
   * @function
   *
   */
  function _handle_node_scroll(evt, posID, node)
  {
    var scr_handle = scroll_parents_attached[posID], g;
    if (scr_handle) {
      if (scr_handle.tID) {
        clearTimeout(scr_handle.tID);
        delete scr_handle.tID;
      }
      scr_handle.tID = setTimeout(function()
      {
        var params = rendered_ifrs[posID],
          id		= (params && params.dest),
          ifr		= (id && _elt(id)),
          g, msgObj;

        if (ifr && params) {
          g				= _build_geom(posID, ifr, TRUE);
          msgObj			= ParamHash();
          msgObj.pos		= posID;
          msgObj.cmd		= NOTIFY_GEOM_UPDATE;
          msgObj.geom		= _es(g);
          _fire_pub_callback(POS_MSG, posID, NOTIFY_GEOM_UPDATE, g);
          _send_response(params, msgObj);
        }

        delete scr_handle.tID;

      }, GEOM_UPDATE_INTRVAL);
    }
  }

  /**
   * Update all SafeFrames with updated focus information
   *
   * @name $sf.host-_update_focus
   * @static
   * @private
   * @function
   * @param {Boolean} in_focus True when the window has gained focus
   *
   */

  function _update_focus(in_focus)
  {
    var posID, params, msgObj, id, ifr;
    for (posID in rendered_ifrs)
    {
      params 			= rendered_ifrs[posID];
      id				= (params && params.dest);
      ifr				= (id && _elt(id));
      if (ifr && params) {
        msgObj			= ParamHash();
        data 			= ParamHash();
        msgObj.pos		= posID;
        msgObj.cmd		= data.cmd = NOTIFY_FOCUS_CHANGE;
        msgObj.value	= in_focus;

        _fire_pub_callback(POS_MSG, posID, NOTIFY_FOCUS_CHANGE, in_focus);
        _send_response(params, msgObj);
      }
    }
    _clear_focus_update_timer();
  }


  /**
   * Handle the window focus event, which notifies ads of the change
   *
   */
  function _handle_win_focus(evt)
  {
    _set_focus_update_timer(TRUE);
  }

  /**
   * Handle the window blur event, which notifies ads of the change
   *
   */
  function _handle_win_blur(evt)
  {
    var f = win[DOC].hasFocus();
    _set_focus_update_timer(f);
  }

  /**
   * Handle the window onscroll event, eventually leading to a geometric update
   *
   * @name $sf.host-_handle_win_geom_scroll
   * @static
   * @private
   * @function
   * @param {HTMLEvent} evt The raw event object
   *
   */
  function _handle_win_geom_scroll(evt)
  {
    _set_geom_update_timer(1);
  }

  /**
   * Handle the window onresize event, eventually leading to a geometric update
   * once the window events are slowed down
   *
   * @name $sf.host-_handle_win_geom_resize
   * @static
   * @private
   * @function
   * @param {HTMLEvent} evt The raw event object
   *
   */
  function _handle_win_geom_resize(evt)
  {
    _set_geom_update_timer();
  }

  /**
   * Handle the window unload event, clearing up our state
   *
   * @name $sf.host-_handle_unload
   * @static
   * @private
   * @function
   * @param {HTMLEvent} evt The raw event object
   *
   */
  function _handle_unload(evt)
  {
    var prop, scr_handle, e;

    _clear_geom_update_timer();

    try {
      dom.detach(win, SCROLL, _handle_win_geom_scroll);
      dom.detach(win, "resize", _handle_win_geom_resize);
      dom.detach(win, "unload", _handle_unload);
      dom.detach(win, "focus", _handle_win_focus);
      dom.detach(win, "blur", _handle_win_blur);

      for (prop in scroll_parents_attached)
      {
        scr_handle = scroll_parents_attached[prop];
        if (scr_handle) {
          if (scr_handle.tID) clearTimeout(scr_handle.tID);
          dom.detach(scroll_parents_attached[prop], SCROLL, scr_handle[ONSCROLL]);
          scr_handle[ONSCROLL] 	=
            scr_handle.node			= NULL;
        }
        scroll_parents_attached[prop] = NULL;
        delete scroll_parents_attached[prop];
      }
      win_events_attached	= FALSE;
    } catch (e) {

    }
  }

  /**
   * Handle the window message event, passed from raw event handling of the msghost code.
   * Pass through the data to our format handling functions for expand, etc.
   *
   * @name $sf.host-_handle_msg_evt
   * @static
   * @private
   * @function
   * @param {String|Object} data the message to be handled
   * @return {Boolean} return whether or not the message was handled
   *
   */

  function _handle_msg_evt(data)
  {
    var msgObj, ret = FALSE, info;

    msgObj 	= ParamHash(data,NULL,NULL,TRUE,TRUE);
    if (msgObj && msgObj.pos) {
      info	= rendered_ifrs[msgObj.pos];
      if (info) {
        switch (msgObj.cmd)
        {
          case "exp-push":
            _expand_safeframe(msgObj,TRUE);
            ret = TRUE;
            break;
          case "exp-ovr":
            _expand_safeframe(msgObj);
            ret = TRUE;
            break;
          case "collapse":
            _collapse_safeframe(msgObj);
            ret = TRUE;
            break;
          case "msg":
            _fire_pub_callback(POS_MSG, msgObj.pos, "msg", msgObj.msg);
            ret = TRUE;
            break;
          case ERROR_COMMAND:
            _record_error(msgObj);
            ret = TRUE;
            break;
          case NOTIFY_GEOM_UPDATE:
            sf.lib.logger.log("Geom update complete: " + msgObj.pos);
            ret = TRUE;
            break;
          case "read-cookie":
            var canRead = info.conf && info.conf.supports && info.conf.supports[msgObj.cmd] && info.conf.supports[msgObj.cmd] != "0";
            if(canRead){
              _read_cookie(msgObj);
              ret = TRUE;
            }
            else{
              ret = FALSE;
            }
            break;
          case "write-cookie":
            var canWrite = info.conf && info.conf.supports && info.conf.supports[msgObj.cmd] && info.conf.supports[msgObj.cmd] != "0";
            if(canWrite){
              _write_cookie(msgObj);
              ret = TRUE;
            }
            else{
              ret = FALSE;
            }
            break;

        }
      }
    }
    return ret;
  }

  /**
   * Check whether or not there are any SafeFrames being rendered
   *
   * @name $sf.host-_has_pending_renders
   * @static
   * @private
   * @function
   *
   */

  function _has_pending_renders()
  {
    var all_renders_done = TRUE, pos_id;

    for (pos_id in pending_ifrs)
    {
      all_renders_done = FALSE;
      break;
    }
    return all_renders_done;
  }


  /**
   * Send a response back down to the SafeFrame after a message was handled
   *
   * @name $sf.host-_send_response
   * @private
   * @static
   * @function
   * @param {$sf.lib.lang.ParamHash} params The parameters object stored for a rendered SafeFrame holding state information
   * @param {$sf.lib.lang.ParamHash} msgObj The message to send back down into the SafeFrame
   *
   */

  function _send_response(params, msgObj)
  {
    /** @ignore */
    /* we use a timeout here so that sending a response is asynchronus,just in case we got ping-pong messages */

    current_status = "sending-msg-down-" + msgObj.cmd;

    setTimeout(function()
    {
      var id = params && params.dest;

      if (id && msgObj) send_msg_to_child_iframe(id, msgObj.toString());
      current_status = "";

      msgObj = id = params = NULL;
    }, XCOM_RESP_DELAY);
  }

  /**
   * Handle the onload event from the IFRAME tag created for a SafeFrame.
   * Note that b/c we used our own library to create the IFRAME ($sf.lib.dom.iframes),
   * the "this" keyword will now properly point to the IFRAME in question.
   *
   * @name $sf.host-_handle_frame_load
   * @private
   * @static
   * @function
   *
   */

  function _handle_frame_load()
  {
    var el = this, pos_id = dom.attr(el, "_pos_id"), all_renders_done = TRUE;

    if (pending_ifrs[pos_id]) {
      clearTimeout(pending_ifrs[pos_id]);
      delete pending_ifrs[pos_id];
      complete_ifrs[pos_id]	= pos_id;
      dom.attr(el, "_pos_id", NULL);
      dom.attr(el, "name", NULL);
      el[ST].visibility 	= "inherit";
      el[ST].display		= "block";
      _fire_pub_callback("onEndPosRender", pos_id);
    }

    if (!_has_pending_renders()) current_status = "";
  }

  /**
   * Build an extra IFRAME to put behind any iframe that is expanding, to protect
   * against painting issues in IE with window'd mode flash.
   *
   * @name $sf.host-_shim_frame
   * @private
   * @static
   * @function
   *
   */

  function _shim_frame(id, showIt, w, h, z)
  {
    if (!isIE) return;

    var ifr = _elt(id), shmID = "shm_" + id, shmFrm = _elt(shmID);

    if (showIt) {
      if (shmFrm) {
        shmFrm[ST].visibility = "visible";
        return;
      }
      shmFrm  = iframes.clone(ifr, {id:shmID,src:"",name:shmID}, [WIDTH, ":", w, PX,";position:absolute;",HEIGHT,":", h, PX,";z-index:", z - 1,";filter:progid:DXImageTransform.Microsoft.Alpha(opacity=0)"]);
      dom.append(_par(ifr),shmFrm);

    } else if (!showIt && shmFrm) {
      shmFrm[ST].visibility = "hidden";
    }
  }

  /**
   * Build a geometry info object for a particular SafeFrame position, and also
   * may attach an onscroll event listener to a parent HTML element if said parent element
   * is scrollable but not the root document node / body
   *
   * @name $sf.host-_build_geom
   * @private
   * @static
   * @function
   * @return {Object} With information about the geometry around a given SafeFrame
   *
   */
  function _build_geom(posID, dest, dont_attach_scroll_evt)
  {
    var bounds, info = ParamHash(), details = {}, scr_handle, node, new_ref_node, ex, s, e;

    try {
      bounds	= dom.bounds(dest,details,TRUE);

      if (!dont_attach_scroll_evt && !details.isRoot && details.canScroll) {
        ex				= details.expRect;
        if (ex.xs || ex.ys) {
          scr_handle		= scroll_parents_attached[posID];
          new_ref_node	= details.refNode;

          if (scr_handle && scr_handle.node != new_ref_node) {
            if (scr_handle.tID) clearTimeout(scr_handle.tID);
            dom.detach(node, SCROLL, scr_handle[ONSCROLL]);
            scr_handle.node = scr_handle[ONSCROLL] 	= NULL;
            scroll_parents_attached[posID] 		  	= NULL;
            delete scroll_parents_attached[posID];
          }
          if (!scroll_parents_attached[posID]) {
            scr_handle				= {};
            scr_handle.node 		= new_ref_node;
            /** @ignore */
            scr_handle[ONSCROLL]	= function(evt)
            {
              _handle_node_scroll(evt, posID);
            };
            scroll_parents_attached[posID] = scr_handle;

            dom.attach(new_ref_node, SCROLL, scr_handle[ONSCROLL]);
          }
        }
      }
    } catch (e) {
      info = NULL;
    }

    try {
      if (info) {
        info.win	= ParamHash(dom.winRect());
        info.par 	= ParamHash(details.refRect);

        ex			= ParamHash(details.expRect);
        s			= ParamHash(details.rect);
        s.iv		= ex.iv;
        s.xiv		= ex.xiv;
        s.yiv		= ex.yiv;
        delete ex.iv;
        delete ex.xiv;
        delete ex.yiv;

        info.exp	= ex;
        info.self	= s;
      }
    } catch (e) {
      info = NULL;
    }
    return info;
  }

  /**
   * Expands a given SafeFrame based on a command from the 3rd party content
   *
   * @name $sf.host-_expand_safeframe
   * @private
   * @static
   * @function
   * @param {$sf.lib.lang.ParamHash} msgObj Details about how to do the expansion
   *
   * TODO, handle omni-directional and push
   */

  function _expand_safeframe(msgObj, push)
  {
    var xn = FALSE, yn = FALSE, posID = (msgObj && msgObj.pos), params, params_conf, ifr, par, ifrSt, parSt,
      orWd, orHt, dx, dy, nWd, nHt, id,t,l,r,b,exp,
      z, delta, scr_handle;

    if(!posID) return;

    params			= rendered_ifrs[posID];
    params_conf		= (params && params.conf);

    if (!params || !params_conf) return;

    id		= params.dest;
    ifr		= _elt(id);
    par		= _elt(POS_REL_BOX_ID_PREFIX + "_" + posID);
    if (!ifr || !par) return;

    ifrSt	= ifr[ST];
    parSt	= par[ST];

    if (!ifrSt) return;

    scr_handle = scroll_parents_attached[posID];

    if (scr_handle && scr_handle.tID) clearTimeout(scr_handle.tID);

    _clear_geom_update_timer();

    exp 	= msgObj.exp_obj;
    orWd	= params_conf.w;
    orHt	= params_conf.h;

    if (!exp) {
      dx 		= params.dx = _cnum(msgObj.dx);
      dy 		= params.dy = _cnum(msgObj.dy);
      xn		= (dx<0);
      yn		= (dy<0);
      nWd 	= (xn) ? (orWd + (dx * -1)) : (orWd + dx);
      nHt 	= (yn) ? (orHt + (dy * -1)) : (orHt + dy);
    } else {
      t		= _cnum(exp.t,0,0);
      l		= _cnum(exp.l,0,0);
      r		= _cnum(exp.r,0,0);
      b		= _cnum(exp.b,0,0);
      nWd		= _cnum(orWd + l + r,0,0);
      nHt		= _cnum(orHt + t + b,0,0);
      if (t) {
        dy  = t*-1;
        yn  = TRUE;
      } else {
        dy  = 0;
      }
      if (l) {
        dx = l*-1;
        xn = TRUE;
      } else {
        dx = 0;
      }
    }

    if (nWd <= orWd && nHt <= orHt) return;

    if (_fire_pub_callback(BF_POS_MSG, posID, EXPAND_COMMAND, dx ,dy)) return; //event canceled

    ifrSt[WIDTH]	= nWd+PX;
    ifrSt[HEIGHT] 	= nHt+PX;

    if (xn)
      ifrSt.left  = dx+PX;

    if (yn)
      ifrSt.top 	= dy+PX;

    z 	= _cnum(params.z,0);
    if (!z)
      z = DEFAULT_ZINDEX;

    ifrSt.zIndex		= z;

    //Create Shim Iframe to avoid overlapping issues with controls in IE.
    _shim_frame(id, TRUE, nWd, nHt, z-1);

    if (push) {
      parSt[WIDTH]  = nWd+PX;
      parSt[HEIGHT] = nHt+PX;
    } else {
      parSt[WIDTH]  = orWd+PX;
      parSt[HEIGHT] = orHt+PX;
    }

    params.expanded		= TRUE;
    msgObj.dx			= dx;
    msgObj.dy			= dy;
    msgObj.w			= nWd;
    msgObj.h			= nHt;
    msgObj.cmd			= "expand";
    msgObj.geom 		= _es(_build_geom(posID, ifr, TRUE));

    _fire_pub_callback(POS_MSG, posID, EXPAND_COMMAND, dx ,dy);
    _send_response(params, msgObj);
    ifrSt = par = ifr = params = msgObj = NULL;
  }

  /**
   * Collapse a SafeFrame after it has been expanded
   *
   * @name $sf.host-_collapse_safeframe
   * @private
   * @static
   * @function
   * @param {$sf.lib.lang.ParamHash} msgObj The details about the message send from the SafeFrame to collapse
   * @param {Boolean} [isOutside] Whether or not the collapse command came from the publisher
   * @param {Boolean} [noMsging] Whether or not to send a message of response back to the SafeFrame being collapsed
   *
   *
   */

  function _collapse_safeframe(msgObj, isOutside, noMsging)
  {
    var posID		= (msgObj && msgObj.pos),
      params		= (posID && rendered_ifrs[posID]),
      params_conf	= (params && params.conf),
      id			= (params_conf && params_conf.dest),
      ifr			= (id && _elt(id)),
      par			= (ifr && _elt(POS_REL_BOX_ID_PREFIX + "_" + posID)),
      ifrSt		= (ifr && ifr[ST]),
      parSt		= (par && par[ST]),
      scr_handle;

    if (!posID || !params || !ifr || !par) return;
    if (!params.expanded) return;

    scr_handle = scroll_parents_attached[posID];
    if (scr_handle && scr_handle.tID) clearTimeout(scr_handle.tID);
    _clear_geom_update_timer();

    if (!noMsging) {
      if (_fire_pub_callback(BF_POS_MSG, posID, COLLAPSE_COMMAND, 0, 0)) return;
    }

    ifrSt.left		=
      ifrSt.top		="0px";
    parSt[WIDTH]	=
      ifrSt[WIDTH]	= params_conf.w+PX;
    parSt[HEIGHT]	=
      ifrSt[HEIGHT] 	= params_conf.h+PX;
    ifrSt.zIndex	=
      params.dx		=
        params.dy		= 0;

    _shim_frame(id);

    if (!noMsging) {
      _fire_pub_callback(POS_MSG, posID, COLLAPSE_COMMAND, 0, 0);
      msgObj.cmd  	= (isOutside) ? "collapsed" : "collapse";
      msgObj.geom		= _es(_build_geom(posID, ifr, TRUE));
      _send_response(params, msgObj);
    }

    ifr = ifrSt = par = parSt = params = msgObj = NULL;
  }


  /**
   * Records a reported error message to $sf.info.errors and fires any listeners
   *
   * @name $sf.host-_record_error
   * @private
   * @static
   * @function
   * @param {$sf.lib.lang.ParamHash} msgObj The details about the message send from the SafeFrame having an error
   *
   *
   */

  function _record_error(msgObj)
  {
    var posID		= (msgObj && msgObj.pos),
      params		= (posID && rendered_ifrs[posID]),
      params_conf	= (params && params.conf),
      id			= (params_conf && params_conf.dest),
      ifr			= (id && _elt(id)),
      par			= (ifr && _elt(POS_REL_BOX_ID_PREFIX + "_" + posID)),
      ifrSt		= (ifr && ifr[ST]),
      parSt		= (par && par[ST]),
      scr_handle;

    if(sf && sf.info && sf.info.errs){
      sf.info.errs.push(msgObj);
    }

    _fire_pub_callback(POS_MSG, posID, ERROR_COMMAND, msgObj);
  }

  /**
   * Returns the current document cookies as a hash
   * @name $sf.lib._cookieHash
   * @private
   * @static
   * @function
   * @returns {Object}
   *
   */

  function _cookieHash()
  {
    var cooks, key, i, cookies = {}, c;

    cooks = document.cookie.split('; ');
    for(i=cooks.length-1; i>=0; i--){
      c = cooks[i].split("=");
      cookies[c[0]] = c[1];
    }

    return cookies;
  }


  /**
   * Read a host domain cookie
   *
   * @name $sf.host-_read_cookie
   * @private
   * @static
   * @function
   * @param {$sf.lib.lang.ParamHash} msgObj The details about the message send from the SafeFrame
   * @param {Boolean} [isOutside] Whether or not the read-cookie command came from the publisher
   *
   *
   */

  function _read_cookie(msgObj, isOutside)
  {
    var posID		= (msgObj && msgObj.pos),
      params		= (posID && rendered_ifrs[posID]),
      params_conf	= (params && params.conf),
      id			= (params_conf && params_conf.dest),
      ifr			= (id && _elt(id)),
      key, cookies;


    var command = "read-cookie";

    var canRead = params_conf.supports && params_conf.supports[command] && params_conf.supports[command] != "0";

    if(!canRead){
      return;
    }

    if (!posID || !params || !ifr) return;

    key = msgObj.cookie;
    if(!key) return;

    cookies = _cookieHash();

    _fire_pub_callback(POS_MSG, command, posID, 0, 0);
    msgObj.cmd  	=  command;
    msgObj.geom		= _es(_build_geom(posID, ifr, TRUE));
    msgObj.value = cookies[key];
    _send_response(params, msgObj);

    ifr = params = msgObj = NULL;
  }


  /**
   * Write a host domain cookie
   *
   * @name $sf.host-_write_cookie
   * @private
   * @static
   * @function
   * @param {$sf.lib.lang.ParamHash} msgObj The details about the message send from the SafeFrame
   * @param {Boolean} [isOutside] Whether or not the write-cookie command came from the publisher
   *
   *
   */

  function _write_cookie(msgObj, isOutside)
  {
    var posID		= (msgObj && msgObj.pos),
      params		= (posID && rendered_ifrs[posID]),
      params_conf	= (params && params.conf),
      id			= (params_conf && params_conf.dest),
      ifr			= (id && _elt(id)),
      key, newValue, cookies, newCookies;


    var command = "write-cookie";

    var canRead = params_conf.supports && params_conf.supports[command] && params_conf.supports[command] != "0";

    if(!canRead){
      return;
    }

    if (!posID || !params || !ifr) return;

    key = msgObj.cookie;
    if(!key) return;
    newValue = escape(msgObj.value);

    var exdate=new Date();
    exdate.setDate(exdate.getDate() + 1);
    var c_value=newValue + "; expires="+exdate.toUTCString() + "; SameSite=None; Secure";
    document.cookie=key + "=" + c_value;


    _fire_pub_callback(POS_MSG, command, posID, 0, 0);
    msgObj.cmd  	=  command;
    msgObj.geom		= _es(_build_geom(posID, ifr, TRUE));
    msgObj.info 	= newValue;
    msgObj.value = "";
    _send_response(params, msgObj);

    ifr = params = msgObj = NULL;
  }


  /**
   * Remove / destroy one or more SafeFrames from the publisher page
   *
   * @name $sf.host.nuke
   * @static
   * @function
   * @public
   * @param {String} pos_id* One or more position ids to remove from the page. If no arguments are specifed, all positions currently rendered are removed.
   *
   */

  function nuke()
  {
    var idx = 0, empty = TRUE, args = arguments, pos_id, pos, el_id, el, sb_rel, par;

    if (!args[LEN] || args[idx] == "*") {
      args = [];
      for (pos_id in rendered_ifrs)
      {
        args.push(pos_id);
      }
    }


    while (pos_id = args[idx++])
    {
      pos = rendered_ifrs[pos_id];
      if (pos) {
        if (pos_id in pending_ifrs) {
          clearTimeout(pending_ifrs[pos_id]);
          delete pending_ifrs[pos_id];
        }
        if (pos_id in complete_ifrs) delete complete_ifrs[pos_id];

        el_id 	= pos.dest;
        el		= (el_id && _elt(el_id));
        par		= (el && _par(el));

        if (dom.attr(par, "id").indexOf(POS_REL_BOX_ID_PREFIX) != -1) {
          sb_rel 	= par;
          par 	= _par(sb_rel);
        }

        dom.purge(el);

        if (sb_rel) dom.purge(sb_rel);


        rendered_ifrs[pos_id] = NULL;
        delete rendered_ifrs[pos_id];
        el		= dom.make("div");
        dom.attr(el,"id",el_id);
        dom.append(par,el);
      }
    }
    pos_id = "";
    for (pos_id in rendered_ifrs)
    {
      empty = FALSE;
      break;
    }
    if (empty) {
      current_status = "";
      _handle_unload();
    }
  }


  /**
   * Render one or more $sf.host.Position objects into the page
   *
   * @name $sf.host.render
   * @public
   * @static
   * @function
   * @param {$sf.host.Position} pos* An instance of an $sf.host.Position object to render. Note that said object must have a corresponding $sf.host.PosConfig, as well as $sf.host.Config must have been set
   *
   */

  function render()
  {
    var idx 		= 0,
      args		= arguments,
      firstCSSPos = "relative",
      finalCSSPos = "absolute",
      finalCSSEnd = "top:0px;left:0px;visibility:hidden;display:none;",

      pos, pos_id, pos_conf, dest_el, new_dest_el, rel_el, par_el,
      name_params, dest_id, dest_rel_id, css_txt, w, h, st, e, pend;

    if (!config) return FALSE;
    if (!dom.ready()) {
      dom.wait(function() { render.apply(NULL, args); args = NULL });
      return NULL;
    }

    /* if an array of positions is handed in use that instead */
    if ((args[0] instanceof Array) && args[LEN] == 1) {
      args = args[0];
    }

    while (pos = args[idx++])
    {
      pos_id		= pos.id;
      pos_conf	= (pos_id) ? config.positions[pos_id] : NULL;

      if (pos_conf) {
        dest_id		= pos_conf.dest;
        dest_el		= dest_id && _elt(dest_id);

        if (dest_el) {
          w		= pos_conf.w;
          h		= pos_conf.h;

          if (!w) {
            try {
              w	= dest_el.offsetWidth;
            } catch (e) {
              w	= 0;
            }
            if (w) pos_conf.w = w;
          }
          if (!h) {
            try {
              h = dest_el.offsetHeight;
            } catch (e) {
              h = 0;
            }
            if (h) pos_conf.h = h;
          }

          if (w && h) {
            name_params	= new ParamHash();
            dest_rel_id	= POS_REL_BOX_ID_PREFIX + "_" + pos_id;
            rel_el		= _elt(dest_rel_id);
            par_el		= _par(dest_el);

            if (rel_el && par_el == rel_el) par_el	= _par(rel_el);

            _shim_frame(dest_id);

            /** @ignore */
            pend = pending_ifrs[pos_id];
            if (pend) clearTimeout(pend);

            pend = complete_ifrs[pos_id];
            if (pend) delete complete_ifrs[pos_id];

            pending_ifrs[pos_id]	= setTimeout(function()
            {
              _handle_render_timeout(pos_id);

            }, config.to);

            current_status = "rendering";

            _fire_pub_callback("onStartPosRender", pos_id, pos_conf, pos);

            css_txt	= ["position:", "", ";z-index:0;",WIDTH,":", w, PX,";",HEIGHT,":", h, PX,";", "visibility:inherit;"];

            if (!rel_el) {
              css_txt[1]			= firstCSSPos;
              rel_el				= dom.make("div");
              rel_el.id			= dest_rel_id;
              rel_el.className	= "iab_sf";
              new_dest_el			= dest_el.cloneNode(FALSE);
              dom.css(new_dest_el, css_txt);
              rel_el.appendChild(new_dest_el);
              dom.css(rel_el, css_txt);
              par_el.replaceChild(rel_el, dest_el);
              dest_el				= _elt(dest_id);
            } else {
              //Make sure to set container to right geometry in case the pos config changed
              st			= rel_el[ST];
              st.width	= w + PX;
              st.height	= h + PX;
              st			= (dest_el && dest_el[ST]);
              st.width	= w + PX;
              st.height	= h + PX;
            }

            name_params.id			= pos_id;
            name_params.dest		= dest_id;
            name_params.conf		= ParamHash(pos_conf);
            name_params.meta		= pos.meta.toString();
            name_params.html		= _es(pos.html);
            name_params.geom		= _es(_build_geom(pos_id, dest_el));
            name_params.src			= config.renderFile;
            name_params.has_focus 	= lang.cstr(document.hasFocus());

            css_txt[1]			= finalCSSPos;
            css_txt[13]			= finalCSSEnd;

            if (!win_events_attached) {
              dom.attach(win, SCROLL, 	_handle_win_geom_scroll);
              dom.attach(win, "resize", 	_handle_win_geom_resize);
              dom.attach(win, "unload",	_handle_unload);
              dom.attach(win, "focus", _handle_win_focus);
              dom.attach(win, "blur", _handle_win_blur);

              win_events_attached = TRUE;
            }

            iframes.replace({id: dest_id,name:name_params,src:config.renderFile,_pos_id: pos_id},css_txt, rel_el, _handle_frame_load, _handle_msg_evt);

            rendered_ifrs[pos_id]			= name_params;
          }
        }
      }
    }

  }


  /**
   * Gets a copy of the Position configuration, content, and meta data for a given SafeFrame
   *
   * @name $sf.host.get
   * @public
   * @function
   * @static
   * @return {Object}
   */

  function get(positionId)
  {
    var obj = rendered_ifrs[positionId];
    if(!obj) return null;

    return _mix({}, obj);
  }

  /**
   * Returns a string as to whether or not the library is busy, empty string is returned on idle
   *
   * @name $sf.host.status
   * @public
   * @function
   * @static
   * @return {String}
   */

  function status()
  {
    return current_status;
  }

  if (lang) {
    if (win == top) {
      /*
       * We got rid of the concept of a "host" file, and just put everything library wise for the host
       * side into the main host file since it will save us some bytes
       *
      */

      _rect = (ieVer) ? _getRectIE : _getRectNonIE;

      lang.def("dom",
        {
          rect:			_rect,
          currentStyle:	currentStyle,
          contains:		contains,
          docRect:		docRect,
          winRect:		winRect,
          bounds:			bounds,
          overlaps:		overlaps

        }, lib, TRUE);

      /** @ignore */
      (function() {
        var e;
        if (lang) {
          lang.def("msghost",
            {
              prep:		prep_iframe_msging,
              attach:		attach_iframe_msging,
              detach:		detach_iframe_msging,
              usingHTML5:	usingHTML5,
              send:		send_msg_to_child_iframe
            }, dom, TRUE);

          dom[ATTACH](win,MSG,_check_html5_init);
          initID			= "xdm-html5-init-" + _guid();
          locHost			= (locHost.indexOf("file") == 0) ? locHost = "file" : locHost;
          try {
            win[PMSG](initID, (locHost == "file") ? "*" : locHost);
          } catch (e) {
            dom[DETACH](win,MSG,_check_html5_init);
          }
        }
      })();



      lang.def("$sf.host",
        {
          Config:		Config,
          PosConfig:	PosConfig,
          PosMeta:	PosMeta,
          Position:	Position,
          nuke:		nuke,
          get: 		get,
          render:		render,
          status:		status
        }, NULL, TRUE);

    }
  }



})(window);
/*
* Copyright (c) 2012, Interactive Advertising Bureau
* All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

*/

(function(win) {

  var FALSE						= false,
    TRUE						= true,
    NULL						= null,
    SF_DATATAG_CLASS			= "sf_data",
    SF_TAG_TYPE					= "text/x-safeframe",
    AUTO_BOOT_MAX_RETRIES		= 100,
    SF_POSELEM_WRAPPER_CLASS	= "sf_position",
    d							= (win && win.document),
    sf							= (win && win.$sf),
    lib							= (sf && sf.lib),
    lang						= (lib && lib.lang),
    dom							= (lib && lib.dom),
    _cstr						= (lang && lang.cstr),
    _guid						= (lang && lang.guid),
    _elt						= (dom && dom.elt),
    _par						= (dom && dom.par),
    _tags						= (dom && dom.tags),
    _attr						= (dom && dom.attr),
    _purge						= (dom && dom.purge),
    _ready						= (dom && dom.ready),

    inline_tags_processed	= {},
    boot_retries			= 0,
    has_booted	 			= FALSE,
    doing_auto_boot			= FALSE;


  function _log(msg,is_err)
  {
    var head_el, err_tag;

    try {
      if(!lib) lib = (sf && sf.lib); // insure we have lib

      if (lib && lib.logger && win == top) {
        if (is_err) {
          lib.logger.error(msg);
        } else {
          lib.logger.log(msg);
        }
      } else {
        // Append error message as comment to header
        head_el 		= d.getElementsByTagName("head")[0];
        err_tag			= d.createElement("script");
        err_tag.type	= "text/plain";
        err_tag.text	= "<!-- SafeFrame " + ((is_err) ? "error" : "log") + ": " + (msg || "unknown") + " -->";
        head_el.appendChild(head_el, err_tag);
      }
    } catch (e) {  }
  }

  /**
   * Create the HTML markup for a position if a src property was used
   *
   * @name $sf.host-_create_pos_markup
   * @function
   * @private
   * @static
   * @return {String}
   *
   */

  function _create_pos_markup(src)
  {
    return _cstr(["<scr","ipt type='text/javascript', src='", src, "'></scr", "ipt>"]);
  }


  function _auto_boot()
  {
    var do_auto = TRUE, config, sf_host, host_file, head, scr_tag;

    if (has_booted) return;

    sf_host = sf && sf.host;
    if (win == top) {
      if (sf_host && !sf_host.boot) {
        sf_host.boot = boot;
      }
      try {
        config = sf_host && sf_host.Config();
      } catch (e) {
        config = NULL;
      }
      if (!config) {
        try {
          config = sf_host && sf_host.conf;
        } catch (e) {
          config = NULL;
        }
      }
      if (config) {
        if (("auto" in config) && config.auto === FALSE) do_auto = FALSE;

        if (!sf_host.render || !sf_host.Config) {
          host_file		= config.hostFile;
          if (host_file) {
            head				= _tags("head")[0];
            scr_tag				= dom.make("script");
            scr_tag.id  		= "sf_host_lib";
            scr_tag.type		= "text/javascript";
            scr_tag.className	= "sf_lib";
            scr_tag.src			=  host_file;


            if (win.ActiveXObject) {
              scr_tag.onreadystatechange	= function()
              {

                var rs = scr_tag.readyState;

                if (rs == "loaded" || rs == "complete") {

                  doing_auto_boot = FALSE;
                  if (do_auto) boot();
                  scr_tag.onreadystatechange = NULL;
                  scr_tag = head = sf_host = config = NULL;
                }
              }
            } else {
              scr_tag.onload		= function()
              {
                doing_auto_boot = FALSE;
                if (do_auto) boot();
                scr_tag.onload	= NULL;
                scr_tag = head = sf_host = config = NULL;
              }
            }
            doing_auto_boot = TRUE;
            head.appendChild(scr_tag);
            return;
          }
        }
      }

      if (do_auto) {
        if (config) {
          doing_auto_boot = TRUE;
          boot();
          doing_auto_boot = FALSE;
        } else {
          if (boot_retries++ <= AUTO_BOOT_MAX_RETRIES) setTimeout(_auto_boot,50);
        }
      }
    } else {
      boot();
    }
  }


  /**
   * Go through and remove any inline script tags that are our data-islands , which have already been boostrapped
   *
   * @name $sf.host-_clean_up_booted_tags
   * @private
   * @function
   * @static
   *
   *
   */

  function _clean_up_booted_tags()
  {
    var script_tag_id, script_tag;

    if (dom) {
      for (script_tag_id in inline_tags_processed)
      {
        script_tag = _elt(script_tag_id);
        if (script_tag) {
          _purge(script_tag);
          delete inline_tags_processed[script_tag_id];
        }
      }
    }
  }


  /**
   * Search for SafeFrames tags and render them. This function is called
   * automatically whenever the SafeFrames publisher library is loaded. However a configuration
   * can be applied to not have SafeFrames tags automatically be rendered, requiring a controlled
   * call to this function.
   *
   * @name $sf.host.boot
   * @public
   * @function
   * @static
   *
   */

  function boot()
  {
    var	script_tags		= (_tags && _tags("script")) || [],
      boot_positions 	= [],
      idx 			= 0,
      ret				= FALSE,
      errMsg,
      sf_host			= sf && sf.host,
      sf_inline_conf	= sf_host && sf_host.conf,
      script_tag, script_tag_par, script_tag_id, data, html, pos_obj, pos_conf, pos_dest_el,
      pos_meta, pos_meta_item, typ, shared_meta, prv_meta, prv_meta_key, meta_key, sf_ocnf, err;

    if (!sf || !lang || !dom) {
      _log("SafeFrame base library not found",TRUE);
      return ret;
    }

    if(!lib) lib = (sf && sf.lib); // insure we have lib

    if (doing_auto_boot && has_booted) {
      _log("Automatic boot already invoked");
      return ret;
    }
    if (win == top) {
      try {
        sf_conf = sf_host.Config();
      } catch (err) {
        sf_conf = NULL;
      }

      if (sf_inline_conf && !sf_conf) {
        try {
          sf_conf = sf_host.Config(sf_inline_conf);
        } catch (e) {
          sf_conf = NULL;
        }
      }
      if (!sf_conf) {
        _log("No configuration found");
        return ret;
      }
    }

    while (script_tag = script_tags[idx++])
    {
      if (script_tag.className == SF_DATATAG_CLASS || _attr(script_tag, "type") == SF_TAG_TYPE) {
        has_booted 		= TRUE;
        script_tag_id 	= _attr(script_tag, "id");
        if (!script_tag_id) {
          script_tag_id = _guid("sf_data_element");
          _attr(script_tag, "id", script_tag_id);
        }

        /* ignore the tag if we already booted it */

        if (inline_tags_processed[script_tag_id]) continue;

        data	= script_tag.text || script_tag.innerHTML || script_tag.innerText;

        try {
          data = lang.trim(data);
          data = new Function("return " + data);
          data = data();
        } catch (err) {
          data = NULL;
          errMsg = "Error parsing tag configuration " + (err && err.message || '');
          _log(errMsg, TRUE);
          continue;
        }

        if (data && data.id && (data.html || data.src)) {

          if (win != top) {
            html	= data.html || "";
            html	= html || _create_pos_markup(data.src);

            if (!_ready()) {
              d.write(html);
            } else {
              _log("cannot write html content into already loaded document");
            }

          } else {
            script_tag_par	= _par(script_tag);

            if (!script_tag_par) {
              _log("can't find parent element for script tag",TRUE);
              continue;
            }

            /*
             * Check for an existing position config
             *
            */
            pos_conf	= (sf_conf && sf_conf.positions[data.id]);
            if (!pos_conf) {
              /*
               * No position config defined already so check for an inline config
               *
              */
              pos_conf 		= data.conf;
              pos_conf.id		= data.id;
              if (pos_conf) pos_conf = new sf_host.PosConfig(pos_conf);
            }

            if (!pos_conf) {
              _log("no position conf found pre-defined or inline for position " + data.id, TRUE);
              continue;
            }
            if (!pos_conf.dest) {
              /*
               * we are going to auto create a destination element
               *
              */
              pos_conf = new sf_host.PosConfig(pos_conf,_guid(SF_POSELEM_WRAPPER_CLASS));
            }

            if (data.meta) {
              pos_meta	= data.meta;
              meta_key	= "";
              shared_meta	= {};

              /*
               * Process meta data to be shared
               * The 1st key that points to an object of its own, is considered
               * private / owned data.  Any other keys are considered shared data
               *
               * You can't have more than one set of private / owner information unless
               * its nested so having anything other than a structure of key = [some primtive value]
               * or key = [obj] (1) time only, is all that makes sense
               *
              */

              for (meta_key in pos_meta)
              {
                pos_meta_item 	= pos_meta[meta_key];
                typ				= typeof pos_meta_item;

                if (!prv_meta && typ == "object" && pos_meta_item) {
                  prv_meta 		= pos_meta_item;
                  prv_meta_key	= meta_key;
                }
                if (typ != "object" && typ != "function") {
                  shared_meta[meta_key] = pos_meta_item;
                }
              }
              pos_meta	= new sf_host.PosMeta(shared_meta, prv_meta_key || "", (prv_meta_key && prv_meta) ? prv_meta : NULL);

            }

            pos_obj			= new sf_host.Position(data, NULL, pos_meta, pos_conf);

            /*
             * OK we built the position and are ready to render
             * We set a custom attribute on the script tag so that we can ignore it
             * in case someone else calls boot again
             *
             * We will remove these tags from the dom later, but we don't want to do that
             * now b/c the page might be in the process of loading
             *
            */
            inline_tags_processed[script_tag_id]	= script_tag_id;
            pos_dest_el 							= _elt(pos_conf.dest);

            if (!pos_dest_el) {

              if (_ready()) {
                pos_dest_el	= dom.make("div");
                _attr(pos_dest_el, "id", pos_conf.dest);
                try {
                  script_tag_par.insertBefore(pos_dest_el);
                } catch (err) {
                  _log("failed auto-adding destination element " + err.message, TRUE);
                  continue;
                }
              } else {
                d.write("<div id='", pos_conf.dest, "'></div>");
              }
            }

            boot_positions.push(pos_obj);
          }

        } else {
          _log("no content or id property found in the inline position object", TRUE);
        }
        /* end boot loop */
      }
    }

    if (boot_positions.length) {
      try {
        sf_host.render(boot_positions);
      } catch (e) {
        _log("failed during rendering " + e.message);
      }
    } else {
      _log("no positions to boot");
    }

    /*
     * now we set a timer and go through and clean up any already processed tags
     *
    */
    dom.wait(_clean_up_booted_tags);
  }

  setTimeout(_auto_boot,50);

})(window);
