(function () {
    /**
     * Description
     * @class Alchemy.Ingredient
     * @extends Alchemy.MateriaPrima
     */
    var Ingredient = {
        init: function () {

        },

        createFunctionDelegate: function (typeKey, fnKey) {
            var fn;
            /*jslint evil: true*/
            eval([
                'fn = function (a, b, c, d, e) {',
                    'var ingredients = this.getMetaAttr("ingredients"),',
                    '    delegate = ingredients.', typeKey, ';',
                    'return delegate.' + fnKey + '(a, b, c, d, e);',
                '};'
            ].join(''));
            /*jslint evil: false*/
            return fn;
        },

        createPropertyDelegate: function (typeKey, propKey) {
            var getter,
                setter;

            /*jslint evil: true*/
            eval([
                'getter = function () {',
                    //'console.log("read ' + typeKey + '.' + propKey);',
                    'var ingredients = this.getMetaAttr("ingredients"),',
                    '    delegate = ingredients.', typeKey, ';',
                    'return delegate.', propKey, ';',
                '};',
                'setter = function (value) {',
                    //'console.log("write ' + typeKey + '.' + propKey + ':", value);',
                    'var ingredients = this.getMetaAttr("ingredients"),',
                    '    delegate = ingredients.', typeKey, ';',
                    'return delegate.', propKey, ' = value;',
                '};'
            ].join(''));
            /*jslint evil: false*/
            return {
                get: getter,
                set: setter
            };
        },

        addActiveSubstances: function (base, typeKey) {
            var pre = Alchemy.metaPrefix,
                i,
                propKey;

            for (i = 0; i < this.publics.length; i++) {
                propKey = this.publics[i];
                if (Alchemy.isFunction(this[propKey])) {
                    Alchemy.addMethod(base, propKey, this.createFunctionDelegate(typeKey, propKey));
                } else {
                    Alchemy.defineProperty(base, propKey, this.createPropertyDelegate(typeKey, propKey));
                }
            }
        }
    };

    Alchemy.ns('Alchemy');
    Alchemy.Ingredient = Alchemy.brew({
        name: 'Ingredient',
        ns: 'Alchemy',
        extend: Alchemy.MateriaPrima
    }, Ingredient);
} ());
