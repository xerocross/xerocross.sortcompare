import {bubbleSort, mergesort, quicksort, insertionSort} from "xero-algorithms";


export function build () {
    let sortHelper = {};
    sortHelper.sort = function(data) {
        debugger;
        let method;
        switch (data.method) {
        case "bubblesort":
            method = bubbleSort;
            break;
        case "mergesort":
            method = mergesort;
            break;
        case "quicksort":
            method = quicksort;
            break;
        case "insertionSort":
            method = insertionSort;
            break;
        }
        let t0 = performance.now();
        let sortedArray = method(data.array, (x,y)=>{return x-y});
        let t1 = performance.now();
        return {
            time : t1 - t0,
            array : sortedArray
        };
    }
    sortHelper.onmessage = () => {};

    sortHelper.postMessage = function(e) {
        debugger;
        setTimeout(()=> {
            let data = sortHelper.sort(e);
            debugger;
            sortHelper.onmessage({
                data : {
                    time : data.time,
                    array : data.array
                }
            });
        },0);
    }
    return sortHelper;
}