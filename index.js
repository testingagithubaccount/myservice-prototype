let express = require('express'),
  cookieParser = require("cookie-parser"),
  serveIndex = require('serve-index'),
  {
    promisify
  } = require('util'),
  {
    resolve
  } = require('path'),
  fs = require('fs'),
  path = require('path'),
  // Axios = require('axios'),
  Proms = require('bluebird'),
  http = require('http'),
  // featuretoggleapi = require('feature-toggle-api'),

  // not so secret secret
  secret = 'eeeek',

  // will use the PORT environment variable if present,
  // else use first argument from command line for PORT,
  // else default to a hard coded value of 5000
  port = process.env.PORT || process.argv[2] || 5000,
  app = express();

let readdir = promisify(fs.readdir);
let stat = promisify(fs.stat);

// using ejs for rendering
app.use(express.static(__dirname));
app.use(cookieParser());

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');


// this is a pretty nice feature toggle. might be cool to do something like this in the future
// https://www.npmjs.com/package/feature-toggle-api
// var api = featuretoggleapi({
//   feature1: false,
//   feature2: true
// });

app.use(function (req, res, next) {
  res.locals.partials = __dirname + '/partials/';
  next();
});

// used for giant sitemap and link checking
async function getFiles(dir) {
  const subdirs = await readdir(dir);
  const files = await Promise.all(subdirs.map(async (subdir) => {
    const res = resolve(dir, subdir);
    return (await stat(res)).isDirectory() ? getFiles(res) : res;
  }));
  return files.reduce((a, f) => a.concat(f), []);
}

// create sitemap 
app.use('/files', serveIndex('views', {
  'icons': true
}));

app.use(function(req, res, next) {
  res.locals.partials = __dirname + '/partials/';
  next();
});


// create sitemap 
app.use('/files', serveIndex('views', {
  'icons': true
}));

// using body parser to parse the body of incoming post requests
app.use(require('body-parser').urlencoded({
  extended: true // must give a value for extended
}));

// using express-session for session cookies
app.use(

  require('express-session')(

    {
      name: 'site_cookie',
      secret: secret,
      resave: false,
      saveUninitialized: false,
      cookie: {

        // make session cookies only last 15 seconds
        // for the sake of this demo
        maxAge: 15000

      }
    }
  )
);

console.log('build env:', app.settings.env);
var liveFeatureList = require('./feature-flag-list.json');
var liveFeatureEnv = [];

// loading in different lists depending on which git branch (but not in heroku)
if (app.settings.env === "development") {
  var gitBranch = require('git-branch');
}

if (typeof gitBranch !== 'undefined' && gitBranch) {
  console.log('Working on branch:', gitBranch.sync());
  if (gitBranch.sync() === 'master') {
    liveFeatureList = liveFeatureList.production;
  } else {
    liveFeatureEnv = liveFeatureList.development;
  }
} else if (app.settings.env === "production") {
  liveFeatureEnv = liveFeatureList.production;
} else {
  liveFeatureEnv = liveFeatureList.development;
}

console.log('List of features that are unhidden:');
console.log(liveFeatureList);

app.get('/sitemap', (req, res) => {
  var pages = []
  getFiles("./views")
    .then(files => {
      files.forEach((file, index) => {
        file = path.normalize(file);
        file = file.replace(__dirname, "");
        file = file.replace(/\\/g, "/");
        file = file.replace("/views", "");
        var data = fs.readFileSync('./views/' + file, "utf8");
        data = data.match(/<title>(.*)<\/title>/);
        if (data === null) {
          data = "(No Title)";
        } else {
          data = data[1];
        }
        pages.push({
          page: file,
          title: data
        });
      });
      res.render('sitemap', {
        pages
      })
    })
    .catch(e => console.error(e));
});

app.get('/link-checker', (req, res) => {
  getFiles("./views")
  .then((fileTree) => {
    const fixedFiles = fileTree.map(file => {
      file = file.replace(__dirname, "");
      file = file.replace(/\\/g, "/");
      file = file.replace("/views/", "");

      return file
    });

    const listLinks = fixedFiles.map(file => {
      links = fs.readFileSync("./views/" + file, "utf8");
      links = links.match(/href=\"(.*)\"/g);
      links = [...new Set(links)];
      const fixedLinks = links.map(link => {
        link = link.replace(/'/g, "");
        link = link.replace(/"/g, "");
        link = link.replace("href", "");
        link = link.replace(/=/g, "");
        link = link.replace(/ target_blacnk/g, "");
        link = link.replace(/ target_blank/g, "");
        link = link.replace(/ relexternal/g, "");
        if (typeof link !== "undefined" || link.includes("${") || link.includes("#") || link.includes("tel") || link.includes("mailto") || link.includes("javascript") || link.includes("<") || link.includes("uikit-btn")) {
        } else {
          return link
        }
      });
      console.log(fixedLinks);

      return {
        file,
        links: fixedLinks
      }
    });

    res.send(listLinks);

    const allLinks = listLinks.map(linkArray => {

      const localLinks = linkArray.links.map(link => {
        // http.get("http://localhost:5000/"+link, (resp)  => {
        //   resp.setEncoding('utf8');
        //   resp.on('data', (body) => {
        //     console.log('data recieved?');
        //     return {
        //       link,
        //       status: body.statusCode
        //     }
        //   });
        //   resp.on('error', (err) => {console.log(err)});
        // })
      });

      return {
        file: linkArray.file,
        links: linkArray.links
      }
    });


    // res.send(allLinks);

  });
});

// folder level renders 
app.get('/:id0', function (request, response) {
  response.render(request.params.id0, {
    main_nav_active: 'home',
    liveFeature: liveFeatureEnv
  });
});

app.get('/:id0/:id1', function (request, response) {
  response.render(request.params.id0 + "/" + request.params.id1, {
    main_nav_active: request.params.id1,
    liveFeature: liveFeatureEnv
  });
});

app.get('/:id0/:id1/:id2', function (request, response) {
  response.render(request.params.id0 + "/" + request.params.id1 + "/" + request.params.id2, {
    main_nav_active: request.params.id1,
    liveFeature: liveFeatureEnv,
    secondary_nav_active: request.params.id2,
    claimType: request.cookies.claimType
  });
});

app.get('/:id0/:id1/:id2/:id3', function (request, response) {
  response.render(request.params.id0 + "/" + request.params.id1 + "/" + request.params.id2 + "/" + request.params.id3, {
    main_nav_active: request.params.id1,
    liveFeature: liveFeatureEnv,
    secondary_nav_active: request.params.id2
  });
});

app.get('/',
  function (request, response) {
    response.render('unauth/index-loading', {
      layout: 'login',
      user: request.user,
      liveFeature: liveFeatureEnv
    });
  });

app.get('/mygov-login',
  function (request, response) {
    response.render('auth/mygov-login', {
      layout: 'login',
      user: request.user,
      liveFeature: liveFeatureEnv
    });
  });

app.get('/logout',
  function (request, response) {
    request.logout();
    response.redirect('/');
  });


app.post('/styleguide/new_forms_preview', (req, res) => {
  let form_preview = req.body.form_preview;
  console.log(form_preview);
  res.render('styleguide/new_forms_preview', {
    form_preview
  });
});

app.listen(port, function () {
  console.log('listening on port: ' + port);
});