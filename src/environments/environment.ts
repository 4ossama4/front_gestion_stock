// This file can be replaced during build by using the `fileReplacements` array.
// `ng build ---prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  SERVER_URL: `./`,
  production: false,
  useHash: true,
  hmr: false,
  // apiUrl: 'http://127.0.0.1:8000/api',
  apiUrl: 'http://pieces_auto.test/api',
  cheminPFDs: 'http://localhost:4200/assets/factures/',
};

/*
 * In development mode, to ignore zone related error stack frames such as
 * `zone.run`, `zoneDelegate.invokeTask` for easier debugging, you can
 * import the following file, but please comment it out in production mode
 * because it will have performance impact when throw error
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
