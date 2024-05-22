import './awesome-select.scss';

const awesomeSelect = function () {

    const $this = $(this);
    const $content = $this.children(".select-content");
    const $search = $content.children(".select-item-search");
    const $selectLabel = $(`<div class="select-label"></div>`);
    const $input = $(`<input type="hidden">`);
    if ($this.attr("name")) {
        $input.attr("name", $this.attr("name"));
        $this.append($input);
    }

    if ($this.children('.select-label').length) {
        let label = $this.children('.select-label').html();
        $selectLabel.html(label);
        $this.children('.select-label').replaceWith($selectLabel);
        $this.data("label", label);
    } else {
        $this.append($selectLabel).data("init", true);
    }
    updateSelected();

    if ($search.length) {
        $search.html(
            $('<input type="text" placeholder="Search...">')
                .on("input", () => searchHandler($search.find("input").val()))
                .on("keydown", (event) => {
                    if (event.keyCode === 13) {
                        event.preventDefault();  // Prevent the default action for all keyups
                        event.stopPropagation(); // Prevent the event from propagating up the DOM
                        event.stopImmediatePropagation(); // Stop any other handlers from being executed
                    }
                })
                .on("keyup", (event) => {
                    if (event.keyCode === 27) { // Escape key
                        $this.trigger("awesome-select:hide");
                    }

                    if (event.keyCode === 13) { // Enter key
                        // Trigger click on the highlighted item and refresh the list
                        $($content.children(".select-item").filter(".highlighted")[0]).trigger("click");
                        renderItems(); // Refresh list
                    }
                })
        )
    }


    $selectLabel.on("click", toggleContent);
    // get options from children
    $content.children(".select-item").each(function () {
        let options = $this.data("options") || [];
        options.push({ value: $(this).data("value") || '', label: $(this).html() });
        $this.data("options", options);
        if ($(this).hasClass("active")) {
            $this.data("value", $(this).data("value") || '');
        }
    }).on("click", itemClickHandler);

    $this.on("awesome-select:hide", function (e) {

        const $this = $(e.target);
        $this.removeClass("show");
        $this.find(".awesome-select").removeClass("show");
        $search.find("input").val("").trigger("blur");
        if (!$this.closest('.awesome-select .select-content').length) {
            $(document).off("click", clickOutHandler);
        }

    }).on("awesome-select:show", function (e) {

        const $this = $(e.target);
        if ($this.closest('.awesome-select .select-content').length) {
            const { left: offsetLeft, top: offsetTop } = $this.offset();
            $this.children('.select-content').css({
                position: 'fixed',
                top: offsetTop,
                left: offsetLeft + $this.outerWidth(),
                width: $this.outerWidth(),
            });
            // hide other awesome-select at the same level
            $this.closest('.awesome-select .select-content').children('.awesome-select').removeClass("show");
        }

        setTimeout(() => {
            $(e.target).addClass("show");
            $search.find("input").trigger("focus");
            $(document).on("click", clickOutHandler);
            setTimeout(() => scrollToActive(), 100);
        }, 50)

    }).on("options-update", renderItems).on("change", function () {
        $content.children(".select-item").removeClass("active");
        if ($content.children(`.select-item[data-value="${$this.data("value")}"]`).length) {
            $content.children(`.select-item[data-value="${$this.data("value")}"]`).addClass("active");
        } else if ($content.children(".select-item").length) {
            $content.children(".select-item")[0].click();
            $this.data("value", $content.children(".select-item")[0].getAttribute("data-value"));
        }

        updateSelected();
    });

    renderItems();

    function renderItems() {

        $content.children(".select-item").remove();
        $content.append(
            [...$(Array.isArray($this.data("options")) ? $this.data("options") : [])].map(
                (item) => $(`<li class="select-item${item.value == $this.data("value") ? " active" : ""}" data-value="${item.value ?? ''}">${item.label}</li>`).on("click", itemClickHandler)
            )
        );
        $selectLabel.html("");
        if ($content.children(".select-item.active").length <= 0 && $content.children(".select-item").length) {
            $content.children(".select-item")[0].click();
        } else {
            updateSelected();
        }

    }
    function itemClickHandler() {
        $this.data("value", $(this).data("value") || '').trigger("change");
        $content.children(".select-item").removeClass("active");
        $(this).addClass("active");
        updateSelected();
        $this.trigger("awesome-select:hide");
    }

    function scrollToActive() {
        $content.children(".select-item").filter(".active")[0]?.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });
    }

    function updateSelected() {

        if ($this.data("label")) {
            $selectLabel.html($this.data("label"));
            return;
        }
        $selectLabel.html($content.children(".select-item").filter(".active").html());
        $selectLabel.attr("data-value", $content.children(".select-item").filter(".active").attr("data-value"));
        $input.val($content.children(".select-item").filter(".active").attr("data-value"));
    }


    function toggleContent() {
        if ($this.hasClass("show")) {
            $this.trigger("awesome-select:hide");
        } else {
            $this.trigger("awesome-select:show");
        }
    }


    function clickOutHandler(event) {
        if (!$(event.target).closest(".awesome-select").length) {
            $this.trigger("awesome-select:hide");
        }
    }

    function searchHandler(text) {

        renderItems(); // refresh list
        // auto scroll in list on match text
        if (!text || text.length <= 1) {
            return;
        }
        const $items = $content.children(".select-item");
        for (let i = 0; i < $items.length; i++) {
            let regxp = new RegExp(`${text}`, "gi");
            if (regxp.test($items[i].textContent)) {

                let replaceRegxp = new RegExp(`(?<!<[^>]*)${text}`, "gi");
                $($items[i]).addClass("highlighted").html($($items[i]).html().replace(replaceRegxp, `<b class="_Ö">$&</b>`));

                $items[i].scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });
                // Adjust the scroll position for the 35px offset from the top
                const listOffset = $content[0].getBoundingClientRect().top;
                const itemOffset = $items[i].getBoundingClientRect().top;
                const offset = 35;
                $content[0].scrollTop += itemOffset - listOffset - offset;
                break;
            }
        }
    }

}



$.fn.awesomeSelect = function () {
    const $this = $(this);

    if (!$this.data("init")) {
        awesomeSelect.call($this);
    }

    return {

        options(options) {
            if (options) {
                $this.data("options", options).trigger("options-update");
            } else {
                return $this.data("options");
            }
        },
        val(value) {
            if (value) {
                $this.data("value", value).trigger("change").trigger("awesome-select:hide");
            } else {
                return $this.data("value");
            }
        },

        loading(value) {
            $this.data("loading", value).trigger("change");
        },

        hide() {
            $this.trigger("awesome-select:hide");
        },

        show() {
            $this.trigger("awesome-select:show");
        }
    }
}

$(() => $(".awesome-select").each(awesomeSelect));