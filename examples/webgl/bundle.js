(function () {
  'use strict';

  var _arrayApply = function (fs) {
    return function (xs) {
      var l = fs.length;
      var k = xs.length;
      var result = new Array(l * k);
      var n = 0;
      for (var i = 0; i < l; i++) {
        var f = fs[i];
        for (var j = 0; j < k; j++) {
          result[n++] = f(xs[j]);
        }
      }
      return result;
    };
  };

  // Generated by purs version 0.12.5

  var Semigroupoid = function (compose) {
      this.compose = compose;
  };
  var semigroupoidFn = new Semigroupoid(function (f) {
      return function (g) {
          return function (x) {
              return f(g(x));
          };
      };
  });
  var compose = function (dict) {
      return dict.compose;
  };

  // Generated by purs version 0.12.5

  var Category = function (Semigroupoid0, identity) {
      this.Semigroupoid0 = Semigroupoid0;
      this.identity = identity;
  };
  var identity = function (dict) {
      return dict.identity;
  };
  var categoryFn = new Category(function () {
      return semigroupoidFn;
  }, function (x) {
      return x;
  });

  // Generated by purs version 0.12.5

  // Generated by purs version 0.12.5
  var flip = function (f) {
      return function (b) {
          return function (a) {
              return f(a)(b);
          };
      };
  };
  var $$const = function (a) {
      return function (v) {
          return a;
      };
  };

  var _arrayMap = function (f) {
    return function (arr) {
      var l = arr.length;
      var result = new Array(l);
      for (var i = 0; i < l; i++) {
        result[i] = f(arr[i]);
      }
      return result;
    };
  };

  var _unit = {};

  var _showNumberImpl = function (n) {
    var str = n.toString();
    return isNaN(str + ".0") ? str : str + ".0";
  };

  var _cons = function (head) {
    return function (tail) {
      return [head].concat(tail);
    };
  };

  var _join = function (separator) {
    return function (xs) {
      return xs.join(separator);
    };
  };

  // Generated by purs version 0.12.5

  var SProxy = function () {
      function SProxy() {}    SProxy.value = new SProxy();
      return SProxy;
  }();
  var IsSymbol = function (reflectSymbol) {
      this.reflectSymbol = reflectSymbol;
  };
  var reflectSymbol = function (dict) {
      return dict.reflectSymbol;
  };

  var _unsafeGet = function (label) {
    return function (rec) {
      return rec[label];
    };
  };

  // Generated by purs version 0.12.5

  // Generated by purs version 0.12.5

  var RLProxy = function () {
      function RLProxy() {}    RLProxy.value = new RLProxy();
      return RLProxy;
  }();

  // Generated by purs version 0.12.5

  var ShowRecordFields = function (showRecordFields) {
      this.showRecordFields = showRecordFields;
  };
  var Show = function (show) {
      this.show = show;
  };
  var showRecordFieldsNil = new ShowRecordFields(function (v) {
      return function (v1) {
          return [];
      };
  });
  var showRecordFields = function (dict) {
      return dict.showRecordFields;
  };
  var showRecord = function (dictRowToList) {
      return function (dictShowRecordFields) {
          return new Show(function (record) {
              var v = showRecordFields(dictShowRecordFields)(RLProxy.value)(record);
              if (v.length === 0) {
                  return "{}";
              }            return _join(" ")(["{", _join(", ")(v), "}"]);
          });
      };
  };
  var showNumber = new Show(_showNumberImpl);
  var show = function (dict) {
      return dict.show;
  };
  var showRecordFieldsCons = function (dictIsSymbol) {
      return function (dictShowRecordFields) {
          return function (dictShow) {
              return new ShowRecordFields(function (v) {
                  return function (record) {
                      var tail = showRecordFields(dictShowRecordFields)(RLProxy.value)(record);
                      var key = reflectSymbol(dictIsSymbol)(SProxy.value);
                      var focus = _unsafeGet(key)(record);
                      return _cons(_join(": ")([key, show(dictShow)(focus)]))(tail);
                  };
              });
          };
      };
  };

  // Generated by purs version 0.12.5

  // Generated by purs version 0.12.5

  var Functor = function (map) {
      this.map = map;
  };
  var map = function (dict) {
      return dict.map;
  };
  var $$void = function (dictFunctor) {
      return map(dictFunctor)($$const(_unit));
  };
  var functorFn = new Functor(compose(semigroupoidFn));
  var functorArray = new Functor(_arrayMap);

  // Generated by purs version 0.12.5

  var Apply = function (Functor0, apply) {
      this.Functor0 = Functor0;
      this.apply = apply;
  };
  var applyArray = new Apply(function () {
      return functorArray;
  }, _arrayApply);
  var apply = function (dict) {
      return dict.apply;
  };
  var applySecond = function (dictApply) {
      return function (a) {
          return function (b) {
              return apply(dictApply)(map(dictApply.Functor0())($$const(identity(categoryFn)))(a))(b);
          };
      };
  };

  // Generated by purs version 0.12.5

  var Applicative = function (Apply0, pure) {
      this.Apply0 = Apply0;
      this.pure = pure;
  };
  var pure = function (dict) {
      return dict.pure;
  };
  var liftA1 = function (dictApplicative) {
      return function (f) {
          return function (a) {
              return apply(dictApplicative.Apply0())(pure(dictApplicative)(f))(a);
          };
      };
  };

  var _arrayBind = function (arr) {
    return function (f) {
      var result = [];
      for (var i = 0, l = arr.length; i < l; i++) {
        Array.prototype.push.apply(result, f(arr[i]));
      }
      return result;
    };
  };

  // Generated by purs version 0.12.5
  var Bind = function (Apply0, bind) {
      this.Apply0 = Apply0;
      this.bind = bind;
  };
  var bindArray = new Bind(function () {
      return applyArray;
  }, _arrayBind);
  var bind = function (dict) {
      return dict.bind;
  };

  var _findIndexImpl = function (just) {
    return function (nothing) {
      return function (f) {
        return function (xs) {
          for (var i = 0, l = xs.length; i < l; i++) {
            if (f(xs[i])) return just(i);
          }
          return nothing;
        };
      };
    };
  };

  var _deleteAt = function (just) {
    return function (nothing) {
      return function (i) {
        return function (l) {
          if (i < 0 || i >= l.length) return nothing;
          var l1 = l.slice();
          l1.splice(i, 1);
          return just(l1);
        };
      };
    };
  };

  var _concatArray = function (xs) {
    return function (ys) {
      if (xs.length === 0) return ys;
      if (ys.length === 0) return xs;
      return xs.concat(ys);
    };
  };

  // Generated by purs version 0.12.5

  // Generated by purs version 0.12.5
  var Semigroup = function (append) {
      this.append = append;
  };
  var semigroupArray = new Semigroup(_concatArray);
  var append = function (dict) {
      return dict.append;
  };

  // Generated by purs version 0.12.5

  var Alt = function (Functor0, alt) {
      this.Functor0 = Functor0;
      this.alt = alt;
  };
  var altArray = new Alt(function () {
      return functorArray;
  }, append(semigroupArray));

  // Generated by purs version 0.12.5

  // Generated by purs version 0.12.5

  var Monad = function (Applicative0, Bind1) {
      this.Applicative0 = Applicative0;
      this.Bind1 = Bind1;
  };
  var ap = function (dictMonad) {
      return function (f) {
          return function (a) {
              return bind(dictMonad.Bind1())(f)(function (v) {
                  return bind(dictMonad.Bind1())(a)(function (v1) {
                      return pure(dictMonad.Applicative0())(v(v1));
                  });
              });
          };
      };
  };

  // Generated by purs version 0.12.5

  // Generated by purs version 0.12.5

  var _foldrArray = function (f) {
    return function (init) {
      return function (xs) {
        var acc = init;
        var len = xs.length;
        for (var i = len - 1; i >= 0; i--) {
          acc = f(xs[i])(acc);
        }
        return acc;
      };
    };
  };

  var _foldlArray = function (f) {
    return function (init) {
      return function (xs) {
        var acc = init;
        var len = xs.length;
        for (var i = 0; i < len; i++) {
          acc = f(acc)(xs[i]);
        }
        return acc;
      };
    };
  };

  // Generated by purs version 0.12.5

  var Plus = function (Alt0, empty) {
      this.Alt0 = Alt0;
      this.empty = empty;
  };

  // Generated by purs version 0.12.5

  // Generated by purs version 0.12.5

  // Generated by purs version 0.12.5

  // Generated by purs version 0.12.5

  // Generated by purs version 0.12.5

  // Generated by purs version 0.12.5

  // Generated by purs version 0.12.5

  // Generated by purs version 0.12.5

  // Generated by purs version 0.12.5

  // Generated by purs version 0.12.5

  // Generated by purs version 0.12.5

  // Generated by purs version 0.12.5

  // Generated by purs version 0.12.5

  // Generated by purs version 0.12.5

  // Generated by purs version 0.12.5
  var Monoid = function (Semigroup0, mempty) {
      this.Semigroup0 = Semigroup0;
      this.mempty = mempty;
  };
  var mempty = function (dict) {
      return dict.mempty;
  };

  // Generated by purs version 0.12.5

  var Nothing = function () {
      function Nothing() {}    Nothing.value = new Nothing();
      return Nothing;
  }();
  var Just = function () {
      function Just(value0) {
          this.value0 = value0;
      }    Just.create = function (value0) {
          return new Just(value0);
      };
      return Just;
  }();
  var maybe = function (v) {
      return function (v1) {
          return function (v2) {
              if (v2 instanceof Nothing) {
                  return v;
              }            if (v2 instanceof Just) {
                  return v1(v2.value0);
              }            throw new Error("Failed pattern match at Data.Maybe (line 217, column 1 - line 217, column 51): " + [v.constructor.name, v1.constructor.name, v2.constructor.name]);
          };
      };
  };
  var functorMaybe = new Functor(function (v) {
      return function (v1) {
          if (v1 instanceof Just) {
              return new Just(v(v1.value0));
          }        return Nothing.value;
      };
  });
  var fromJust = function (dictPartial) {
      return function (v) {
          if (v instanceof Just) {
              return v.value0;
          }        throw new Error("Failed pattern match at Data.Maybe (line 268, column 1 - line 268, column 46): " + [v.constructor.name]);
      };
  };

  // Generated by purs version 0.12.5

  // Generated by purs version 0.12.5

  // Generated by purs version 0.12.5

  // Generated by purs version 0.12.5

  // Generated by purs version 0.12.5

  // Generated by purs version 0.12.5

  // Generated by purs version 0.12.5

  // Generated by purs version 0.12.5

  // Generated by purs version 0.12.5

  // Generated by purs version 0.12.5

  var Foldable = function (foldMap, foldl, foldr) {
      this.foldMap = foldMap;
      this.foldl = foldl;
      this.foldr = foldr;
  };
  var foldr = function (dict) {
      return dict.foldr;
  };
  var traverse_ = function (dictApplicative) {
      return function (dictFoldable) {
          return function (f) {
              return foldr(dictFoldable)(function ($195) {
                  return applySecond(dictApplicative.Apply0())(f($195));
              })(pure(dictApplicative)(_unit));
          };
      };
  };
  var foldMapDefaultR = function (dictFoldable) {
      return function (dictMonoid) {
          return function (f) {
              return foldr(dictFoldable)(function (x) {
                  return function (acc) {
                      return append(dictMonoid.Semigroup0())(f(x))(acc);
                  };
              })(mempty(dictMonoid));
          };
      };
  };
  var foldableArray = new Foldable(function (dictMonoid) {
      return foldMapDefaultR(foldableArray)(dictMonoid);
  }, _foldlArray, _foldrArray);

  // Generated by purs version 0.12.5

  // Generated by purs version 0.12.5

  // Generated by purs version 0.12.5

  // Generated by purs version 0.12.5

  // Generated by purs version 0.12.5

  // Generated by purs version 0.12.5

  // Generated by purs version 0.12.5

  // Generated by purs version 0.12.5

  // jshint maxparams: 3

  var _traverseArrayImpl = function () {
    function array1(a) {
      return [a];
    }

    function array2(a) {
      return function (b) {
        return [a, b];
      };
    }

    function array3(a) {
      return function (b) {
        return function (c) {
          return [a, b, c];
        };
      };
    }

    function concat2(xs) {
      return function (ys) {
        return xs.concat(ys);
      };
    }

    return function (apply) {
      return function (map) {
        return function (pure) {
          return function (f) {
            return function (array) {
              function go(bot, top) {
                switch (top - bot) {
                  case 0:
                    return pure([]);
                  case 1:
                    return map(array1)(f(array[bot]));
                  case 2:
                    return apply(map(array2)(f(array[bot])))(f(array[bot + 1]));
                  case 3:
                    return apply(apply(map(array3)(f(array[bot])))(f(array[bot + 1])))(f(array[bot + 2]));
                  default:
                    // This slightly tricky pivot selection aims to produce two
                    // even-length partitions where possible.
                    var pivot = bot + Math.floor((top - bot) / 4) * 2;
                    return apply(map(concat2)(go(bot, pivot)))(go(pivot, top));
                }
              }
              return go(0, array.length);
            };
          };
        };
      };
    };
  }();

  // Generated by purs version 0.12.5
  var semigroupFirst = new Semigroup(function (v) {
      return function (v1) {
          if (v instanceof Just) {
              return v;
          }        return v1;
      };
  });
  var monoidFirst = new Monoid(function () {
      return semigroupFirst;
  }, Nothing.value);
  var functorFirst = functorMaybe;
  var altFirst = new Alt(function () {
      return functorFirst;
  }, append(semigroupFirst));
  var plusFirst = new Plus(function () {
      return altFirst;
  }, mempty(monoidFirst));

  // Generated by purs version 0.12.5
  var semigroupLast = new Semigroup(function (v) {
      return function (v1) {
          if (v1 instanceof Just) {
              return v1;
          }        if (v1 instanceof Nothing) {
              return v;
          }        throw new Error("Failed pattern match at Data.Maybe.Last (line 52, column 1 - line 52, column 45): " + [v.constructor.name, v1.constructor.name]);
      };
  });
  var monoidLast = new Monoid(function () {
      return semigroupLast;
  }, Nothing.value);
  var functorLast = functorMaybe;
  var altLast = new Alt(function () {
      return functorLast;
  }, append(semigroupLast));
  var plusLast = new Plus(function () {
      return altLast;
  }, mempty(monoidLast));

  // Generated by purs version 0.12.5

  // Generated by purs version 0.12.5

  var Traversable = function (Foldable1, Functor0, sequence, traverse) {
      this.Foldable1 = Foldable1;
      this.Functor0 = Functor0;
      this.sequence = sequence;
      this.traverse = traverse;
  };
  var traverse = function (dict) {
      return dict.traverse;
  };
  var sequenceDefault = function (dictTraversable) {
      return function (dictApplicative) {
          return traverse(dictTraversable)(dictApplicative)(identity(categoryFn));
      };
  };
  var traversableArray = new Traversable(function () {
      return foldableArray;
  }, function () {
      return functorArray;
  }, function (dictApplicative) {
      return sequenceDefault(traversableArray)(dictApplicative);
  }, function (dictApplicative) {
      return _traverseArrayImpl(apply(dictApplicative.Apply0()))(map(dictApplicative.Apply0().Functor0()))(pure(dictApplicative));
  });

  // Generated by purs version 0.12.5

  // Generated by purs version 0.12.5

  // Generated by purs version 0.12.5

  // Generated by purs version 0.12.5

  // Generated by purs version 0.12.5

  // Generated by purs version 0.12.5

  // Generated by purs version 0.12.5

  // Generated by purs version 0.12.5

  // Generated by purs version 0.12.5

  // Generated by purs version 0.12.5

  // Generated by purs version 0.12.5

  var _pureE = function (a) {
    return function () {
      return a;
    };
  };

  var _bindE = function (a) {
    return function (f) {
      return function () {
        return f(a())();
      };
    };
  };

  // Generated by purs version 0.12.5

  var monadEffect = new Monad(function () {
      return applicativeEffect;
  }, function () {
      return bindEffect;
  });
  var bindEffect = new Bind(function () {
      return applyEffect;
  }, _bindE);
  var applyEffect = new Apply(function () {
      return functorEffect;
  }, ap(monadEffect));
  var applicativeEffect = new Applicative(function () {
      return applyEffect;
  }, _pureE);
  var functorEffect = new Functor(liftA1(applicativeEffect));

  var _new = function (val) {
    return function () {
      return { value: val };
    };
  };

  var _read = function (ref) {
    return function () {
      return ref.value;
    };
  };

  var _modify$prime = function (f) {
    return function (ref) {
      return function () {
        var t = f(ref.value);
        ref.value = t.state;
        return t.value;
      };
    };
  };

  // Generated by purs version 0.12.5

  var modify = function (f) {
      return _modify$prime(function (s) {
          var s$prime = f(s);
          return {
              state: s$prime,
              value: s$prime
          };
      });
  };

  // Generated by purs version 0.12.5

  // Generated by purs version 0.12.5

  // Generated by purs version 0.12.5

  // Generated by purs version 0.12.5

  // Generated by purs version 0.12.5

  // Generated by purs version 0.12.5

  // Generated by purs version 0.12.5

  // Generated by purs version 0.12.5

  // Generated by purs version 0.12.5

  // Generated by purs version 0.12.5

  // Generated by purs version 0.12.5
  var singleton = function (a) {
      return [a];
  };
  var findIndex = _findIndexImpl(Just.create)(Nothing.value);
  var deleteAt = _deleteAt(Just.create)(Nothing.value);
  var deleteBy = function (v) {
      return function (v1) {
          return function (v2) {
              if (v2.length === 0) {
                  return [];
              }            return maybe(v2)(function (i) {
                  return fromJust()(deleteAt(i)(v2));
              })(findIndex(v(v1))(v2));
          };
      };
  };
  var concatMap = flip(bind(bindArray));
  var mapMaybe = function (f) {
      return concatMap(function ($117) {
          return maybe([])(singleton)(f($117));
      });
  };
  var catMaybes = mapMaybe(identity(categoryFn));

  // Generated by purs version 0.12.5

  var _reallyUnsafeRefEq = function (a) {
    return function (b) {
      return a === b;
    };
  };

  // Generated by purs version 0.12.5

  var unsafeRefEq = _reallyUnsafeRefEq;

  // Generated by purs version 0.12.5
  var subscribe = function (v) {
      return function (k) {
          return v(function ($70) {
              return $$void(functorEffect)(k($70));
          });
      };
  };
  var openChannel = function __do() {
      var v = _new([])();
      return {
          event: function (k) {
              return function __do() {
                  var v1 = modify(function (v1) {
                      return append(semigroupArray)(v1)([k]);
                  })(v)();
                  return function __do() {
                      var v2 = modify(deleteBy(unsafeRefEq)(k))(v)();
                      return _unit;
                  };
              };
          },
          sender: function (a) {
              return bind(bindEffect)(_read(v))(traverse_(applicativeEffect)(foldableArray)(function (k) {
                  return k(a);
              }));
          }
      };
  };
  var foldp = function (dictShow) {
      return function (dictShow1) {
          return function (f) {
              return function (b) {
                  return function (v) {
                      return function (s) {
                          return function __do() {
                              var v1 = _new(b)();
                              return v(function (a) {
                                  return bind(bindEffect)(modify(f(a))(v1))(s);
                              })();
                          };
                      };
                  };
              };
          };
      };
  };

  var _tickImpl = function (openChannel) {
    return function () {
      var channel = openChannel();
      var elapsedMS = 0;
      var TARGET_FPMS = 60 / 1000;
      var MAX_ELAPSED = 100;
      var lastTick = window.performance.now();
      var tick = function (now) {
        if (now > lastTick) {
          elapsedMS = now - lastTick;
          if (elapsedMS > MAX_ELAPSED) {
            elapsedMS = MAX_ELAPSED;
          }
          // console.log('requestAnimationFrame')
          channel.sender(elapsedMS * TARGET_FPMS)();
        }
        lastTick = now;
        window.requestAnimationFrame(tick);
      };

      window.requestAnimationFrame(tick);

      return channel.event;
    };
  };

  // Generated by purs version 0.12.5

  var tick = _tickImpl(openChannel);

  var _initRendererImpl = function (cfg) {
    return function () {
      var canvas = createCanvas(cfg);
      var parent = document.querySelector(cfg.selector);
      var graphics = [];

      parent.appendChild(canvas);

      setupRenderLoop(graphics);

      return {
        graphics: graphics,
        canvas: canvas,
        gl: canvas.getContext('webgl')
      };
    };
  };


  // //////////////////////////////////////////////////////////
  // //////////////////////////////////////////////////////////
  // PRIVATE HELPER

  function createCanvas(cfg) {
    var canvas = document.createElement('canvas');
    var scale = window.devicePixelRatio || 1;
    canvas.width = cfg.width * scale;
    canvas.height = cfg.height * scale;
    canvas.style.width = cfg.width + 'px';
    canvas.style.height = cfg.height + 'px';
    return canvas;
  }

  function setupRenderLoop(graphics) {
    function loop(now) {
      for (var i = 0, l = graphics.length; i < l; i++) {
        graphics[i]();
      }
      window.requestAnimationFrame(loop);
    }

    window.requestAnimationFrame(loop);
  }

  // Generated by purs version 0.12.5
  var render = function (cfg) {
      return function (ev) {
          return function (v) {
              return function __do() {
                  var v1 = _initRendererImpl(cfg)();
                  var v2 = v(v1)();
                  var v3 = subscribe(ev)(v2.update)();
                  return function __do() {
                      v3();
                      return v2.remove();
                  };
              };
          };
      };
  };

  var program;
  var positionBuffer;
  var texcoordBuffer;

  var _spriteRenderImpl = function (cfg) {
    return function (ctxt) {
      // Ctxt -> Effect { spriteData, remove }
      return function () {
        var s = Object.assign({}, cfg);
        var gl = ctxt.gl;
        var cw = ctxt.canvas.width;
        var ch = ctxt.canvas.height;

        program = program || createSprite2dProgramm(gl);
        positionBuffer = positionBuffer || createBuffer(gl);
        texcoordBuffer = texcoordBuffer || createBuffer(gl);

        // look up where the vertex data needs to go.
        var positionLocation = gl.getAttribLocation(program, 'a_position');
        var texcoordLocation = gl.getAttribLocation(program, 'a_texcoord');

        // lookup uniforms
        var matrixLocation = gl.getUniformLocation(program, 'u_matrix');
        var textureLocation = gl.getUniformLocation(program, 'u_texture');

        var tex = loadImageAndCreateTexture(gl, s.texture);

        function draw() {
          gl.bindTexture(gl.TEXTURE_2D, tex);

          // Tell WebGL to use our shader program pair
          gl.useProgram(program);

          // Setup the attributes to pull data from our buffers
          gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
          gl.enableVertexAttribArray(positionLocation);
          gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
          gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
          gl.enableVertexAttribArray(texcoordLocation);
          gl.vertexAttribPointer(texcoordLocation, 2, gl.FLOAT, false, 0, 0);

          // this matrix will convert from pixels to clip space
          var matrix = orthographic(0, cw, ch, 0, -1, 1);

          // this matrix will translate our quad to dstX, dstY
          translate(matrix, s.xpos, s.ypos, 0, matrix);

          // this matrix will scale our 1 unit quad
          // from 1 unit to texWidth, texHeight units
          scale(matrix, s.width, s.height, 1, matrix);

          // Set the matrix.
          gl.uniformMatrix4fv(matrixLocation, false, matrix);

          // Tell the shader to get the texture from texture unit 0
          gl.uniform1i(textureLocation, 0);

          // draw the quad (2 triangles, 6 vertices)
          gl.drawArrays(gl.TRIANGLES, 0, 6);
        }

        ctxt.graphics.push(draw);

        return {
          sprite: s,
          remove: function () {
            ctxt.graphics = ctxt.graphics.filter(function (fn) {
              return fn !== draw;
            });
          }
        };
      };
    };
  };


  // exports.list = function (sl) {
  //   return function (ctxt) { // Graphic ( Ctxt -> Effect { update, remove } )
  //     return function () {
  //       var graphics = sl.map(function (s) { return s(ctxt)() })
  //
  //       return {
  //         update: function (a) {
  //           return function () {
  //           }
  //         },
  //
  //         remove: function () {
  //         }
  //       }
  //     }
  //   }
  // }

  // //////////////////////////////////////////////////////////
  // //////////////////////////////////////////////////////////
  // PRIVATE HELPER

  function createSprite2dProgramm(gl) {
    var program = gl.createProgram();
    var shaders = [{
      shader: gl.createShader(gl.FRAGMENT_SHADER),
      source: ['precision mediump float;', 'varying vec2 v_texcoord;', 'uniform sampler2D u_texture;', 'void main() {', '  gl_FragColor = texture2D(u_texture, v_texcoord);', '}'].join('')
    }, {
      shader: gl.createShader(gl.VERTEX_SHADER),
      source: ['attribute vec4 a_position;', 'attribute vec2 a_texcoord;', 'uniform mat4 u_matrix;', 'varying vec2 v_texcoord;', 'void main() {', '  gl_Position = u_matrix * a_position;', '  v_texcoord = a_texcoord;', '}'].join('')
    }];

    shaders.forEach(function (p) {
      gl.shaderSource(p.shader, p.source);
      gl.compileShader(p.shader);

      if (!gl.getShaderParameter(p.shader, gl.COMPILE_STATUS)) {
        throw new Error('Cannot compile shader: ' + gl.getShaderInfoLog(p.shader));
      }

      gl.attachShader(program, p.shader);
    });

    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      // something went wrong with the link
      var lastError = gl.getProgramInfoLog(program);
      throw new Error('Error in program linking: ' + lastError);
    }

    return program;
  }

  function loadImageAndCreateTexture(gl, url) {
    var tex = gl.createTexture();

    // init texture with 1x1 blue pixel while image is loading
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 255, 255]));

    // let's assume all images are not a power of 2
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

    var img = new window.Image();
    img.addEventListener('load', function () {
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    });

    img.src = url;

    return tex;
  }

  function orthographic(left, right, bottom, top, near, far, dst) {
    dst = dst || new Float32Array(16);

    dst[0] = 2 / (right - left);
    dst[1] = 0;
    dst[2] = 0;
    dst[3] = 0;
    dst[4] = 0;
    dst[5] = 2 / (top - bottom);
    dst[6] = 0;
    dst[7] = 0;
    dst[8] = 0;
    dst[9] = 0;
    dst[10] = 2 / (near - far);
    dst[11] = 0;
    dst[12] = (left + right) / (left - right);
    dst[13] = (bottom + top) / (bottom - top);
    dst[14] = (near + far) / (near - far);
    dst[15] = 1;

    return dst;
  }

  function translate(m, tx, ty, tz, dst) {
    // This is the optimized version of
    // return multiply(m, translation(tx, ty, tz), dst)
    dst = dst || new Float32Array(16);

    var m00 = m[0];
    var m01 = m[1];
    var m02 = m[2];
    var m03 = m[3];
    var m10 = m[1 * 4 + 0];
    var m11 = m[1 * 4 + 1];
    var m12 = m[1 * 4 + 2];
    var m13 = m[1 * 4 + 3];
    var m20 = m[2 * 4 + 0];
    var m21 = m[2 * 4 + 1];
    var m22 = m[2 * 4 + 2];
    var m23 = m[2 * 4 + 3];
    var m30 = m[3 * 4 + 0];
    var m31 = m[3 * 4 + 1];
    var m32 = m[3 * 4 + 2];
    var m33 = m[3 * 4 + 3];

    if (m !== dst) {
      dst[0] = m00;
      dst[1] = m01;
      dst[2] = m02;
      dst[3] = m03;
      dst[4] = m10;
      dst[5] = m11;
      dst[6] = m12;
      dst[7] = m13;
      dst[8] = m20;
      dst[9] = m21;
      dst[10] = m22;
      dst[11] = m23;
    }

    dst[12] = m00 * tx + m10 * ty + m20 * tz + m30;
    dst[13] = m01 * tx + m11 * ty + m21 * tz + m31;
    dst[14] = m02 * tx + m12 * ty + m22 * tz + m32;
    dst[15] = m03 * tx + m13 * ty + m23 * tz + m33;

    return dst;
  }

  function scale(m, sx, sy, sz, dst) {
    // This is the optimized verison of
    // return multiply(m, scaling(sx, sy, sz), dst)
    dst = dst || new Float32Array(16);

    dst[0] = sx * m[0 * 4 + 0];
    dst[1] = sx * m[0 * 4 + 1];
    dst[2] = sx * m[0 * 4 + 2];
    dst[3] = sx * m[0 * 4 + 3];
    dst[4] = sy * m[1 * 4 + 0];
    dst[5] = sy * m[1 * 4 + 1];
    dst[6] = sy * m[1 * 4 + 2];
    dst[7] = sy * m[1 * 4 + 3];
    dst[8] = sz * m[2 * 4 + 0];
    dst[9] = sz * m[2 * 4 + 1];
    dst[10] = sz * m[2 * 4 + 2];
    dst[11] = sz * m[2 * 4 + 3];

    if (m !== dst) {
      dst[12] = m[12];
      dst[13] = m[13];
      dst[14] = m[14];
      dst[15] = m[15];
    }

    return dst;
  }

  function createBuffer(gl) {
    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

    var data = new Float32Array([0, 0, 0, 1, 1, 0, 1, 0, 0, 1, 1, 1]);

    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

    return buffer;
  }

  var _unsafeSetObjectProperty = function (key) {
    return function (obj) {
      return function (val) {
        return function () {
          obj[key] = val;
        };
      };
    };
  };

  // Generated by purs version 0.12.5

  // Generated by purs version 0.12.5

  var Image = function (x) {
      return x;
  };
  var Asset = function (x) {
      return x;
  };
  var ypos = function (obj) {
      return pure(applicativeEffect)(function (x) {
          return _unsafeSetObjectProperty("ypos")(obj)(x);
      });
  };
  var xpos = function (obj) {
      return pure(applicativeEffect)(function (x) {
          return _unsafeSetObjectProperty("xpos")(obj)(x);
      });
  };
  var sprite = function (sdata) {
      return function (as) {
          return function (ctxt) {
              return function __do() {
                  var v = _spriteRenderImpl(sdata)(ctxt)();
                  var v1 = traverse(traversableArray)(applicativeEffect)(function (v1) {
                      return v1(v.sprite);
                  })(as)();
                  return {
                      update: function (a) {
                          return traverse_(applicativeEffect)(foldableArray)(function (f) {
                              return f(a);
                          })(v1);
                      },
                      remove: v.remove
                  };
              };
          };
      };
  };
  var list = function (gs) {
      return function (ctxt) {
          return function __do() {
              var v = traverse(traversableArray)(applicativeEffect)(function (v) {
                  return v(ctxt);
              })(gs)();
              return {
                  update: function (a) {
                      return traverse_(applicativeEffect)(foldableArray)(function (v1) {
                          return v1.update(a);
                      })(v);
                  },
                  remove: traverse_(applicativeEffect)(foldableArray)(function (v1) {
                      return v1.remove;
                  })(v)
              };
          };
      };
  };
  var image = function ($21) {
      return Asset(Image($21));
  };
  var cmap = function (f) {
      return function (v) {
          return function (o) {
              return function __do() {
                  var v1 = v(o)();
                  return function ($22) {
                      return v1(f($22));
                  };
              };
          };
      };
  };

  // Generated by purs version 0.12.5

  var view = function (s) {
      return list([sprite({
          xpos: s.s1.x,
          ypos: s.s1.y,
          width: 100.0,
          height: 100.0,
          texture: image("img/star.jpg")
      })([cmap(function (v) {
          return v.s1.x;
      })(xpos), cmap(function (v) {
          return v.s1.y;
      })(ypos)]), sprite({
          xpos: s.s2.x,
          ypos: s.s2.y,
          width: 100.0,
          height: 100.0,
          texture: image("img/leaves.jpg")
      })([cmap(function (v) {
          return v.s2.x;
      })(xpos), cmap(function (v) {
          return v.s2.y;
      })(ypos)]), sprite({
          xpos: s.s3.x,
          ypos: s.s3.y,
          width: 100.0,
          height: 100.0,
          texture: image("img/keyboard.jpg")
      })([cmap(function (v) {
          return v.s3.x;
      })(xpos), cmap(function (v) {
          return v.s3.y;
      })(ypos)])]);
  };
  var update = function (v) {
      return function (s) {
          var updateOne = function (o) {
              var dy = function () {
                  var $9 = o.y + o.dy <= 500.0 && o.y + o.dy >= 0.0;
                  if ($9) {
                      return o.dy;
                  }                return -o.dy;
              }();
              var y = o.y + dy;
              var dx = function () {
                  var $10 = o.x + o.dx <= 700.0 && o.x + o.dx >= 0.0;
                  if ($10) {
                      return o.dx;
                  }                return -o.dx;
              }();
              var x = o.x + dx;
              return {
                  x: x,
                  y: y,
                  dx: dx,
                  dy: dy
              };
          };
          return {
              s1: updateOne(s.s1),
              s2: updateOne(s.s2),
              s3: updateOne(s.s3)
          };
      };
  };
  var renderCfg = {
      width: 400,
      height: 300,
      selector: "body"
  };
  var initialState = {
      s1: {
          x: 100.0,
          y: 100.0,
          dx: 5.0,
          dy: 5.0
      },
      s2: {
          x: 200.0,
          y: 100.0,
          dx: -5.0,
          dy: -1.0
      },
      s3: {
          x: 150.0,
          y: 200.0,
          dx: 1.0,
          dy: -3.0
      }
  };
  var main = function __do() {
      var v = tick();
      var stateE = foldp(showNumber)(showRecord()(showRecordFieldsCons(new IsSymbol(function () {
          return "s1";
      }))(showRecordFieldsCons(new IsSymbol(function () {
          return "s2";
      }))(showRecordFieldsCons(new IsSymbol(function () {
          return "s3";
      }))(showRecordFieldsNil)(showRecord()(showRecordFieldsCons(new IsSymbol(function () {
          return "dx";
      }))(showRecordFieldsCons(new IsSymbol(function () {
          return "dy";
      }))(showRecordFieldsCons(new IsSymbol(function () {
          return "x";
      }))(showRecordFieldsCons(new IsSymbol(function () {
          return "y";
      }))(showRecordFieldsNil)(showNumber))(showNumber))(showNumber))(showNumber))))(showRecord()(showRecordFieldsCons(new IsSymbol(function () {
          return "dx";
      }))(showRecordFieldsCons(new IsSymbol(function () {
          return "dy";
      }))(showRecordFieldsCons(new IsSymbol(function () {
          return "x";
      }))(showRecordFieldsCons(new IsSymbol(function () {
          return "y";
      }))(showRecordFieldsNil)(showNumber))(showNumber))(showNumber))(showNumber))))(showRecord()(showRecordFieldsCons(new IsSymbol(function () {
          return "dx";
      }))(showRecordFieldsCons(new IsSymbol(function () {
          return "dy";
      }))(showRecordFieldsCons(new IsSymbol(function () {
          return "x";
      }))(showRecordFieldsCons(new IsSymbol(function () {
          return "y";
      }))(showRecordFieldsNil)(showNumber))(showNumber))(showNumber))(showNumber)))))(update)(initialState)(v);
      var v1 = render(renderCfg)(stateE)(view(initialState))();
      return _unit;
  };

  main();

}());
