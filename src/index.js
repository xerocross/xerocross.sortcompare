import Vue from "vue";
import SortCompare from "./components/sort-compare.vue";

new Vue({
    el : "#sort-compare",
    components : {
        SortCompare
    },
    render : function (createElement) {
        return createElement(SortCompare, {
            props : {
                "sortWorkerUrl" : "/js/sort-worker.js"
            }
        });
    }
});