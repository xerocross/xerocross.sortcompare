<template>
    <div class="sort-compare">
        <p>
            Here we 
            illustrate some of the inherent speed differences between
            a few classic sorting algorithms.
        </p>
        <form @submit.prevent="">
            <label>
                Select the size of the array: {{ size }}
            </label>
            <input 
                v-model="sliderVal" 
                class="size-slider"
                type="range" 
                min="10"
                max="500"
            />
        </form>
        <p>Test Array: <span v-if="!isReady">(building)</span></p>
        <p 
            v-if="!isDone" 
            class="array-disp"
        >
            <span v-if="isReady">{{ arrayString }}</span>
        </p>
        <p 
            v-if="isDone" 
            class="array-disp"
        >
            <span v-if="isReady">{{ sortedArrayString }}</span>
        </p>
        <div>
            <a 
                class="btn btn-primary sort-button" 
                @click="sort"
            >{{ (!isReady || isWorking) ? 'working' : 'sort' }}</a>
        </div>
        <div class="results">
            <table class="table">
                <thead>
                    <tr>                
                        <th>Sorting Algorithm</th>
                        <th>Time</th>
                    </tr>
                </thead>
                <tr>                
                    <td>Bubble Sort</td>
                    <td><span class="sort-time bubble-sort">{{ formatNumber(bublesortTime) }}</span> ms</td>
                </tr>
                <tr>                
                    <td>Insertion Sort</td>
                    <td><span class="sort-time insertion-sort">{{ formatNumber(insertionSortTime) }}</span> ms</td>
                </tr>
                <tr>                
                    <td>Merge Sort</td>
                    <td><span class="sort-time merge-sort">{{ formatNumber(mergesortTime) }}</span> ms</td>
                </tr>
                <tr>                
                    <td>Quick Sort</td>
                    <td><span class="sort-time quick-sort">{{ formatNumber(quicksortTime) }}</span> ms</td>
                </tr>
            </table>
        </div>
    </div>
</template>
<script>
import Debounce from "lodash.debounce";
import q from "q";
import { build as getSortHelper } from "../sort-helper";

export default {
    components : {
    },
    props : {
        sortWorkerUrl : {
            type : String,
            default : ""
        }
    },
    data () {
        return {
            integerArray : [],
            bublesortTime : undefined,
            quicksortTime : undefined,
            mergesortTime : undefined,
            insertionSortTime : undefined,
            tempResult : "",
            sliderVal : 10,
            isReady : false,
            isWorking : false,
            sortedArray : [],
            isDone : false,
            sortWorker : null
        }
    },
    watch : {
        sliderVal : Debounce(function() {
            this.isReady = false;
            this.updateInput();
        },500)
    },
    computed : {
        arrayString () {
            return this.integerArray.join(", ");
        },
        sortedArrayString () {
            return this.sortedArray.join(", ");
        },
        size () {
            let multiplier = 80;
            return multiplier*this.sliderVal;
        }
    },
    mounted () {
        this.updateInput();
    },
    methods : {
        getWorker () {
            if (typeof Worker === "function" && this.sortWorkerUrl.length > 0) {
                this.$emit("USING_WEB_WORKER");
                return new Worker(this.sortWorkerUrl);
            } else {
                this.$emit("USING_LOCAL_SORT_HELPER");
                return getSortHelper();
            }
        },
        clear () {
            this.bublesortTime = undefined;
            this.quicksortTime = undefined;
            this.mergesortTime = undefined;
            this.insertionSortTime = undefined;
        },
        updateInput () {
            let self = this;
            this.$emit("BUILDING_EVENT");
            this.integerArray = []
            this.isReady = false;
            this.isDone = false;
            setTimeout(function() {
                for (let i = 0; i < self.size; i++) {
                    self.integerArray.push(Math.floor(Math.random()*10*self.size));
                }
                self.isReady = true;
                self.$emit("READY_EVENT");
            },0);
        },
        testMergesort () {
            let deferred = q.defer();
            let self = this;
            let wk = this.getWorker();
            wk.onmessage = function(e) {
                self.mergesortTime = e.data.time;
                deferred.resolve(true);
            }
            wk.postMessage({
                method : "mergesort",
                array : this.integerArray
            });
            
            return deferred.promise;
        },
        testBublesort () {
            let deferred = q.defer();
            let self = this;
            let wk = this.getWorker();
            wk.onmessage = function(e) {
                self.bublesortTime = e.data.time;
                self.updateSortedList(e.data.array);
                deferred.resolve(true);
            }
            wk.postMessage({
                method : "bubblesort",
                array : this.integerArray
            });
            
            return deferred.promise;
        },
        updateSortedList(arr) {
            this.sortedArray = [];
            for (let i = 0; i < arr.length; i ++) {
                this.sortedArray.push(arr[i]);
            }
        },
        testQuicksort () {
            let deferred = q.defer();
            let self = this;
            let wk = this.getWorker();
            wk.onmessage = function(e) {
                self.quicksortTime = e.data.time;
                deferred.resolve(true);
            }
            wk.postMessage({
                method : "quicksort",
                array : this.integerArray
            });
            
            return deferred.promise;
        },
        testInsertionSort () {
            let deferred = q.defer();
            let self = this;
            let wk = this.getWorker();
            wk.onmessage = function(e) {
                self.insertionSortTime = e.data.time;
                deferred.resolve(true);
            }
            wk.postMessage({
                method : "insertionSort",
                array : this.integerArray
            });
            return deferred.promise;
        },
        formatNumber (num) {
            if (typeof num == "number") {
                return Math.round(num);
            } else {
                return "";
            }
        },
        sort () {
            let self = this;
            if (!this.isReady) {
                return;
            }
            if (this.isWorking) {
                return;
            }
            this.clear();
            this.isWorking = true;
            self.$emit("SORTING_EVENT");
            this.isDone = false;
            setTimeout(function(){
                q.all([
                    self.testMergesort(),
                    self.testQuicksort(),
                    self.testBublesort(),
                    self.testInsertionSort()
                ])
                    .then(function() {
                        self.isWorking = false;
                        self.isDone = true;
                        self.$emit("DONE_SORTING_EVENT");
                    });
            },0);

        }
    }
}
</script>
<style lang="scss">
.sort-compare {
    .array-disp {
        height: 100px;
        overflow: scroll;
        margin-left: 10px;
        margin-right: 10px;
        border-style: solid;
        border-color: rgb(37, 37, 37);

    }
    .results {
        margin-left: 20px;
        margin-right:20px;
    }
}
</style>