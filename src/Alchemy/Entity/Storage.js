'use strict';

function Storage() {
    this.components = {};
}

Storage.prototype.getComponent = function (key) {
    var cmp = this.components[key];

    if (!cmp) {
        cmp = {};
        this.components[key] = cmp;
    }

    return cmp;
};

Storage.prototype.get = function (entityId, cmpFilter) {
    var entity = { entityId: entityId };

    for (var i = 0, l = cmpFilter.length; i < l; i++) {
        var cf = cmpFilter[i];
        var cmp = this.components[cf.name];
        var val = cmp && cmp[entityId];

        if (typeof val !== 'undefined') {
            entity[cf.name] = val;
        } else {
            return null;
        }
    }

    return entity;
};

Storage.prototype.set = function (entity) {
    var entityId = entity.entityId;
    var cmpKeys = Object.keys(entity);

    for (var i = 0, l = cmpKeys.length; i < l; i++) {
        var key = cmpKeys[i];

        if (key === 'entityId') {
            continue;
        }

        this.getComponent(key)[entityId] = entity[key];
    }
};

exports.empty = function () {
    return new Storage();
};

exports.init = function (entities) {
    var s = new Storage();

    for (var i = 0, l = entities.length; i < l; i++) {
        s.set(entities[i]);
    }

    return s;
};

exports.setFn = function (r) {
    return function (s) {
        return function () {
            s.set(r);
            return s;
        };
    };
};

// exports.setManyFn = function (rs) {
//     return function (s) {
//         return function () {
//             for (var i = 0, l = rs.length; i < l; i++) {
//                 s.set(rs[i]);
//             }
//             return s;
//         };
//     };
// };

function Accessor(store, cmpFilter, entityIds) {
    this.store = store;
    this.cmpFilter = cmpFilter;
    this.entityIds = entityIds;
}

Accessor.prototype.forEach = function (callback, ctxt) {
    var entityIds = this.entityIds;

    if (!entityIds) {
        var base = this.store.getComponent(this.cmpFilter[0].name);
        entityIds = Object.keys(base);
    }

    for (var i = 0, l = entityIds.length; i < l; i++) {
        var entityId = entityIds[i];
        var entity = this.store.get(entityId, this.cmpFilter);

        if (entity) {
            callback.call(ctxt, entity);
        }
    }
};

Accessor.prototype.run = function (fn) {
    this.forEach(function (entity) {
        this.store.set(fn(entity));
    }, this);
};

exports.access = function (store) {
    return new Accessor(store, [], null);
};

exports.withFn = function (key) {
    return function (accessor) {
        return new Accessor(
            accessor.store,
            accessor.cmpFilter.concat({
                name: key,
                required: true
            }),
            accessor.entityIds
        );
    };
};

exports.whereId = function (entityId) {
    return function (accessor) {
        return new Accessor(
            accessor.store,
            accessor.cmpFilter,
            (accessor.entityIds || []).concat(entityId)
        );
    };
};

exports.readFn = function (stream) {
    return function (acc) {
        return stream(function (cb) {
            acc.forEach(cb);
        });
    };
};

exports.runFn = function (fn) {
    return function (acc) {
        return function () {
            acc.run(fn);
            return {};
        };
    };
};

// exports.write = function (stream) {
//     return function (store) {
//         return function () {
//             stream.val(function (entity) {
//                 store.set(entity);
//             });
//             return {};
//         };
//     };
// };

exports.get = function (rows) {
    return function (store) {
        return function () {
            console.log('GET', rows)
            return {};
        };
    };
};
