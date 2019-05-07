/* eslint-disable no-global-assign */
import SortCompare from "./components/sort-compare.vue";
import { shallowMount } from "@vue/test-utils";
import { build as getSortHelper } from "./sort-helper";

function getSizeSlider (sortCompare) {
    return sortCompare.find(".size-slider");
}

function getSortButton (sortCompare) {
    return sortCompare.find(".sort-button");
}

function getSortTimeBubble (sortCompare) {
    return sortCompare.find(".sort-time.bubble-sort")
}

function getSortTimeInsertionSort (sortCompare) {
    return sortCompare.find(".sort-time.insertion-sort")
}

function getSortTimeQuickSort (sortCompare) {
    return sortCompare.find(".sort-time.quick-sort")
}
function getSortTimeMergeSort (sortCompare) {
    return sortCompare.find(".sort-time.merge-sort")
}

beforeEach(() => {
    window.Worker = () => {
        throw new Error("Worker is unspecified");
    }
});

test("can mount element without workers", () => {
    window.Worker = undefined;
    expect(() => {
        shallowMount(SortCompare);
    }).not.toThrow();
});

test("size slider mounts", () => {
    window.Worker = undefined;
    const sortCompare = shallowMount(SortCompare);
    const slider = getSizeSlider(sortCompare);
    expect(slider.exists()).toBe(true);
});


test("slider change causes BUILDING_EVENT", (done) => {
    window.Worker = undefined;
    const sortCompare = shallowMount(SortCompare);
    sortCompare.vm.$on("READY_EVENT", () => {
        done();
    });
});

test("slider change causes BUILDING_EVENT", (done) => {
    window.Worker = undefined;
    const sortCompare = shallowMount(SortCompare);
    const slider = getSizeSlider(sortCompare);
    sortCompare.vm.$on("BUILDING_EVENT", () => {
        done();
    });
    sortCompare.vm.$on("READY_EVENT", () => {
        slider.setValue(12);
    });
});

test("sort button exists", () => {
    window.Worker = undefined;
    const sortCompare = shallowMount(SortCompare);
    const sortButton = getSortButton(sortCompare);
    expect(sortButton.exists()).toBe(true);
});



test("sort button triggers sort, and values get populated for sort methods, worker undefined", (done) => {
    window.Worker = undefined;
    const sortCompare = shallowMount(SortCompare);
    const sortButton = getSortButton(sortCompare);
    sortCompare.vm.$on("DONE_SORTING_EVENT", () => {
        expect(getSortTimeBubble(sortCompare).text().length > 0).toBe(true);
        expect(getSortTimeInsertionSort(sortCompare).text().length > 0).toBe(true);
        expect(getSortTimeQuickSort(sortCompare).text().length > 0).toBe(true);
        expect(getSortTimeMergeSort(sortCompare).text().length > 0).toBe(true);
        done();
    });
    sortCompare.vm.$on("READY_EVENT", () => {
        sortButton.trigger("click");
    });
});

test("sort button triggers sort, and values get populated for sort methods, worker defined", (done) => {
    let usedWorker = false;
    window.Worker = function() {
        usedWorker = true;
        this.sortHelper = getSortHelper();
        this.onmessage = ()=>{};
        this.postMessage = (e) => {
            let data = this.sortHelper.sort(e);
            this.onmessage({data : data});
        }
    }
    const sortCompare = shallowMount(SortCompare, {
        propsData : {
            sortWorkerUrl : "someURL"
        }
    });
    const sortButton = getSortButton(sortCompare);
    sortCompare.vm.$on("DONE_SORTING_EVENT", () => {
        expect(getSortTimeBubble(sortCompare).text().length > 0).toBe(true);
        expect(getSortTimeInsertionSort(sortCompare).text().length > 0).toBe(true);
        expect(getSortTimeQuickSort(sortCompare).text().length > 0).toBe(true);
        expect(getSortTimeMergeSort(sortCompare).text().length > 0).toBe(true);
        expect(usedWorker).toBe(true);
        done();
    });
    sortCompare.vm.$on("READY_EVENT", () => {
        sortButton.trigger("click");
    });
});


test("slider button causes sort button to show working, worker undefined", (done) => {
    Worker = undefined;
    const sortCompare = shallowMount(SortCompare);
    const slider = getSizeSlider(sortCompare);
    sortCompare.vm.$on("BUILDING_EVENT", () => {
        let sortButton = getSortButton(sortCompare);
        expect(sortButton.text()).toBe("working");
        done();
    });
    sortCompare.vm.$on("READY_EVENT", () => {
        slider.setValue(12);
    });
});

test("clicking sort button changes text to working, worker undefined", (done) => {
    Worker = undefined;
    const sortCompare = shallowMount(SortCompare);
    let sortButton = getSortButton(sortCompare);
    sortCompare.vm.$on("SORTING_EVENT", () => {
        let sortButton = getSortButton(sortCompare);
        expect(sortButton.text()).toBe("working");
        done();
    });
    sortCompare.vm.$on("READY_EVENT", () => {
        sortButton.trigger("click");
    });
});