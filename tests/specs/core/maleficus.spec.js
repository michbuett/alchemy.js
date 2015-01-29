describe('Maleficus', function () {
    'use strict';

    var alchemy = require('./../../../lib/core/Alchemy.js');
    var subject = alchemy('alchemy.core.Maleficus');

    describe('render', function () {
        it('can replace data attributes', function () {
            expect(subject.render('<div id="<$=data.id$>" class="<$=data.cls$>"><$=data.text$></div>', {
                id: 'test_id',
                cls: 'test_class',
                text: 'test_text'
            })).toBe('<div id="test_id" class="test_class">test_text</div>');
        });

        it('can evaluate loops', function () {
            /*jshint white: false*/
            expect(subject.render([
                '<$ for (var i = 0; i < data.list.length; i++) { $>',
                '<li><$=data.list[i]$></li>',
                '<$ } $>'
            ].join(''), {
                list: [1, 2, 3]
            })).toBe('<li>1</li><li>2</li><li>3</li>');
            /*jshint white: true*/
        });

        it('can evaluate conditions', function () {
            /*jshint white: false*/
            var tpl = [
                '<$ if (data.condition) { $>',
                '<div><$=data.trueVal$></div>',
                '<$ } else { $>',
                '<div><$=data.falseVal$></div>',
                '<$ } $>'
            ].join('');
            /*jshint white: true*/

            expect(subject.render(tpl, {
                condition: true,
                trueVal: 'YEEEHAA!'
            })).toBe('<div>YEEEHAA!</div>');
            expect(subject.render(tpl, {
                condition: false,
                falseVal: 'OH NO!'
            })).toBe('<div>OH NO!</div>');
        });

        it('removes block comments', function () {
            /*jshint white: false*/
            var tpl = [
                '<div>',
                '/*',
                ' * This is a comment',
                ' */',
                'YEEEHAA!/* and another comment*/',
                '</div>'
            ].join('\n');
            /*jshint white: true*/

            expect(subject.render(tpl).replace(/\s/g, '')).toBe('<div>YEEEHAA!</div>');
        });

        it('removes line comments', function () {
            /*jshint white: false*/
            var tpl = [
                '<div>',
                '// This is a comment',
                'YEEEHAA! // and another comment',
                '</div>'
            ].join('\n');
            /*jshint white: true*/

            expect(subject.render(tpl).replace(/\s/g, '')).toBe('<div>YEEEHAA!</div>');
        });

        it('has no access to the main closure scope', function () {
            expect(subject.render('<$=(typeof potions)$>')).toBe('undefined');
        });

        it('has access to the explicitly given closure scope', function () {
            expect(subject.render('<$=(typeof alchemy)$>')).toBe('function');
        });
    });
});
