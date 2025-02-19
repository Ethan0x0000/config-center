import { Experimental } from "./experimental.js";
import { Log } from "./log.js";
import { DNS } from "./dns.js";
import { Inbounds } from "./inbounds.js";
import { Outbounds } from "./outbounds.js";
import { Route } from "./route.js";

console.log('Exporting config module with contents:', {
  Experimental,
  Log,
  DNS,
  Inbounds,
  Outbounds,
  Route
});

export default {
  Experimental,
  Log,
  DNS,
  Inbounds,
  Outbounds,
  Route
}
