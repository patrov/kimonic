var candidates = [  Package.XULRunnerLoader,
                    Package.RhinoLoader,
                    Package.BrowserLoader,
                    Package.CommonJSLoader,
                    Package.ServerLoader,
                    Package.WshLoader ],

    n = candidates.length,
    i, candidate;

for (i = 0; i < n; i++) {
  candidate = candidates[i];
  if (candidate.usable()) {
    Package.loader = candidate;
    if (candidate.setup) candidate.setup();
    break;
  }
}

