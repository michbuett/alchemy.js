<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Jasmine Spec Runner</title>
  <link rel="shortcut icon" type="image/png" href="<%= temp %>/jasmine_favicon.png">
<% css.forEach(function(style){ %>
  <link rel="stylesheet" type="text/css" href="<%= style %>">
<% }) %>

</head>
<body>
<% with (scripts) { %>
  <% [].concat(polyfills, jasmine, boot, vendor, helpers, src, specs,reporters).forEach(function(script){ %>
  <script src="<%= script %>"></script>
  <% }) %>
<% }; %>

    <script type="text/javascript">
        (function() {
            var jasmineEnv = jasmine.getEnv();
            // var htmlReporter = new jasmine.HtmlReporter();

            // jasmineEnv.updateInterval = 1000;
            // jasmineEnv.addReporter(htmlReporter);

            // jasmineEnv.specFilter = function (spec) {
            //     return htmlReporter.specFilter(spec);
            // };

            var alchemy = require('alchemy');
            alchemy.heatUp({
                path: {
                    alchemy: '../lib'
                },

                require: [
                    'alchemy.core.MateriaPrima',
                    'alchemy.core.Observari',
                    'alchemy.core.Oculus',
                    'alchemy.core.Modelum',
                    'alchemy.core.Collectum',
                ],

                onReady: function () {
                    // execute the jasmine specs
                    jasmineEnv.execute();
                }
            });
        })();
    </script>

</body>
</html>

