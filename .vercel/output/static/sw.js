/**
 * Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// If the loader is already loaded, just stop.
if (!self.define) {
  let registry = {};

  // Used for `eval` and `importScripts` where we can't get script URL by other means.
  // In both cases, it's safe to use a global var because those functions are synchronous.
  let nextDefineUri;

  const singleRequire = (uri, parentUri) => {
    uri = new URL(uri + ".js", parentUri).href;
    return registry[uri] || (

        new Promise(resolve => {
          if ("document" in self) {
            const script = document.createElement("script");
            script.src = uri;
            script.onload = resolve;
            document.head.appendChild(script);
          } else {
            nextDefineUri = uri;
            importScripts(uri);
            resolve();
          }
        })

      .then(() => {
        let promise = registry[uri];
        if (!promise) {
          throw new Error(`Module ${uri} didn’t register its module`);
        }
        return promise;
      })
    );
  };

  self.define = (depsNames, factory) => {
    const uri = nextDefineUri || ("document" in self ? document.currentScript.src : "") || location.href;
    if (registry[uri]) {
      // Module is already loading or loaded.
      return;
    }
    let exports = {};
    const require = depUri => singleRequire(depUri, uri);
    const specialDeps = {
      module: { uri },
      exports,
      require
    };
    registry[uri] = Promise.all(depsNames.map(
      depName => specialDeps[depName] || require(depName)
    )).then(deps => {
      factory(...deps);
      return exports;
    });
  };
}
define(['./workbox-54d0af47'], (function (workbox) { 'use strict';

  self.skipWaiting();
  workbox.clientsClaim();

  /**
   * The precacheAndRoute() method efficiently caches and responds to
   * requests for URLs in the manifest.
   * See https://goo.gl/S9QRab
   */
  workbox.precacheAndRoute([{
    "url": "_astro/client.B8JBOVNj.js",
    "revision": null
  }, {
    "url": "_astro/ClientRouter.astro_astro_type_script_index_0_lang.CMTcOisY.js",
    "revision": null
  }, {
    "url": "_astro/Editor.V9JO_odA.js",
    "revision": null
  }, {
    "url": "_astro/Gallery.BSlxygEP.js",
    "revision": null
  }, {
    "url": "_astro/index.Ba4_ASc-.js",
    "revision": null
  }, {
    "url": "_astro/index.BVo0tGF1.css",
    "revision": null
  }, {
    "url": "_astro/index.DNylv4eM.css",
    "revision": null
  }, {
    "url": "_astro/ResizablePanel.CVaCKn_F.js",
    "revision": null
  }, {
    "url": "_astro/Sidebar.BzKVnejt.js",
    "revision": null
  }, {
    "url": "_astro/Toast.Caj2rnBI.js",
    "revision": null
  }, {
    "url": "_astro/Toast.DiamqmqK.js",
    "revision": null
  }, {
    "url": "_astro/ui.0ZFFQBcw.js",
    "revision": null
  }, {
    "url": "favicon-hidden.svg",
    "revision": "6bb908916504c06be9615963a5973c16"
  }, {
    "url": "favicon.svg",
    "revision": "dba7eab52c3d3b0d6b319fa276de40ef"
  }, {
    "url": "humans.txt",
    "revision": "1b78b65ddec90120eab7ab0809752a44"
  }, {
    "url": "opengraph/image.png",
    "revision": "5f4291fd2b9caac3890510d46e11b094"
  }, {
    "url": "registerSW.js",
    "revision": "1872c500de691dce40960bb85481de07"
  }, {
    "url": "robots.txt",
    "revision": "b856bdf5f5e715ef000bce860d975ab1"
  }, {
    "url": "favicon.svg",
    "revision": "dba7eab52c3d3b0d6b319fa276de40ef"
  }, {
    "url": "manifest.webmanifest",
    "revision": "c59f3e10b4768f75a1328a57ad29e948"
  }], {
    "directoryIndex": "index.html"
  });
  workbox.cleanupOutdatedCaches();
  workbox.registerRoute(new workbox.NavigationRoute(workbox.createHandlerBoundToURL("/404")));

}));
