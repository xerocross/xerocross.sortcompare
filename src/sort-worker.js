import { build as getSortHelper } from "./sort-helper";

let sortHelper = getSortHelper();

onmessage = function(e) {
    let data = sortHelper.sort(e.data)
    postMessage(data);
}