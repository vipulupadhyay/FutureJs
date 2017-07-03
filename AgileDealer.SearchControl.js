var isPostingBack = false;
var thisUl = 'ul:not([id="tabs"])';
var currentPagingTop;
var currentPagingBottom;
var masked = false;
var allPageSize = 50;
var defaultPageSize = 15;
var reloadTriggerScrollPosition = 0;
var totalResultSet = 0;
var shouldGetMoreDataOnScroll = true;
var defaultVehicleSearchCriteria = {
    Vin: '',
    IsNew: '',
    IsUsed: '',
    IsCertified: '',
    IsLift: '',
    SortItem: '',
    Years: [],
    ModelTrims: [],
    Makes: [],
    Prices: [],
    Models: [],
    EngineTranslatedEngines: [],
    BodyStyles: [],
    ExteriorColors: [],
    FuelTypes: [],
    Engines: [],
    Drives: [],
    Mileages: [],
    RemainingYears: [],
    RemainingMakes: [],
    RemainingPrices: [],
    RemainingModelTrims: [],
    RemainingBodyStyles: [],
    RemainingExteriorColors: [],
    RemainingFuelTypes: [],
    RemainingEngines: [],
    RemainingDrives: [],
    RemainingMileages: [],
    PageSize: '',
    PageNumber: '',
    IsExpandType: false,
    IsExpandModel: false,
    IsExpandBodyStyle: false,
    IsViewAll: false,
    IsSelectingPrice: false,
    IsSelectingYear: false,
    IsSelectingMake: false,
    IsSelectingBody: false,
    IsSelectingFuel: false,
    IsSelectingColor: false,
    IsSelectingEngine: false,
    IsSelectingDrive: false,
    IsSelectingTrim: false,
    IsSelectingMileage: false,
    IsModelChange: false,
    InLitmitedMode: false

};
var vehicleSearchCriteria = {
    Vin: '',
    IsNew: '',
    IsUsed: '',
    IsCertified: '',
    IsLift: '',
    SortItem: '',
    Years: [],
    ModelTrims: [],
    Makes: [],
    Prices: [],
    Models: [],
    EngineTranslatedEngines: [],
    BodyStyles: [],
    ExteriorColors: [],
    FuelTypes: [],
    Engines: [],
    Drives: [],
    Mileages: [],
    RemainingYears: [],
    RemainingMakes: [],
    RemainingPrices: [],
    RemainingModelTrims: [],
    RemainingBodyStyles: [],
    RemainingExteriorColors: [],
    RemainingFuelTypes: [],
    RemainingEngines: [],
    RemainingDrives: [],
    RemainingMileages: [],
    PageSize: '',
    PageNumber: '',
    IsExpandType: false,
    IsExpandModel: false,
    IsExpandBodyStyle: false,
    IsViewAll: false,
    IsSelectingPrice: false,
    IsSelectingYear: false,
    IsSelectingMake: false,
    IsSelectingBody: false,
    IsSelectingFuel: false,
    IsSelectingColor: false,
    IsSelectingEngine: false,
    IsSelectingDrive: false,
    IsSelectingTrim: false,
    IsSelectingMileage: false,
    IsModelChange: false,
    InLitmitedMode: false
};
var vehicleMasterDataCounter;
$(document).ready(function () {
    searchControl.initialize();
});

var searchControl = {
    initialize: function () {
        if (siteMaster.isLocalStorageNameSupported()) {
            searchControl.checkIsLoadingNewPage();
        }
        searchControl.registerEvents();
        searchControl.setDefaultFilter();
        searchControl.setDefaultMasterDataCounter();
        searchControl.reloadData();
        searchControl.hookUpPagination();
        searchControl.preventPagingToPostBack();
    },
    unmaskedInput: function () {
        $(".price,.rebate,.msrp,.dealersaving").unmask();
    },
    setDefaultMasked: function () {
        $(".price,.rebate,.msrp,.dealersaving").each(function () {
            var that = $(this);
            var result = searchControl.currencyFormat(that.text());
            that.text(result);
        });
    },
    currencyFormat: function (num) {
        return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
    },
    formatThousand: function (num) {
        return num.toString().replace(/\B(?=(?:\d{3})+(?!\d))/g, ",");
    },
    setDefaultFilter: function () {
        $('#txtSearch').val('');
        var defaultTextSearch = $('[id$="HdfSearchText"]').val();
        if (typeof defaultTextSearch != "undefined" && defaultTextSearch != null && defaultTextSearch != '') {
            $('#txtSearch').val(defaultTextSearch);
        }
        var defaultFilter = '';
        var textSearch = '';
        defaultFilter = $('[id$="defaultFilter"]').val();
        if (typeof localStorage != 'undefined' && localStorage.getItem('SearchData') != null && localStorage.getItem('SearchData') != '') {
            if (siteMaster.isLocalStorageNameSupported()) {
                defaultFilter = localStorage.getItem('SearchData');
                textSearch = localStorage.getItem('SearchDataText');
                if (typeof textSearch != 'undefined' && textSearch != '') {
                    $('#txtSearch').val(textSearch);
                    $("#vin-lookup").addClass('in');
                } else
                    $("#vin-lookup").removeClass('in');
                localStorage.setItem('SearchData', '');
                localStorage.setItem('SearchDataText', '');
            }
        }

        vehicleSearchCriteria = $.parseJSON(defaultFilter);
        $.extend(true, defaultVehicleSearchCriteria, vehicleSearchCriteria);
        $(thisUl).find('li.active:not(.list-group-custom-default)').removeClass('active');
        $(thisUl).find('li.list-group-custom-default').addClass('active');
        if (typeof vehicleSearchCriteria != "undefined" && vehicleSearchCriteria != null) {
            if (vehicleSearchCriteria.IsNew || vehicleSearchCriteria.IsUsed || vehicleSearchCriteria.IsCertified) {
                $('ul[data-type="type"]').find('li.list-group-custom-default').removeClass('active');
                if (vehicleSearchCriteria.IsNew) {
                    $('ul[data-type="type"]').find('li[value="new"]').addClass('active');
                }
                if (vehicleSearchCriteria.IsUsed) {
                    $('ul[data-type="type"]').find('li[value="used"]').addClass('active');
                }
                if (vehicleSearchCriteria.IsCertified) {
                    $('ul[data-type="type"]').find('li[value="certified"]').addClass('active');
                }
            }

            if (vehicleSearchCriteria.IsLift) {
                $('ul[data-type="lift"]').find('li.list-group-custom-default').removeClass('active');
                if (vehicleSearchCriteria.IsLift) {
                    $('ul[data-type="lift"]').find('li[value="isLift"]').addClass('active');
                }
            }

            if (vehicleSearchCriteria.Makes != null && vehicleSearchCriteria.Makes.length > 0) {
                var currentMake;
                $('ul[data-type="make"]').find('li.list-group-custom-default').removeClass('active');
                for (var i = 0; i < vehicleSearchCriteria.Makes.length; i++) {
                    currentMake = vehicleSearchCriteria.Makes[i];
                    $('ul[data-type="make"]').find('li[value="' + currentMake + '"]').addClass('active');
                }
            }

            //if (vehicleSearchCriteria.Models != null && vehicleSearchCriteria.Models.length > 0) {
            //    var currentModel;
            //    var parent = $('ul[data-type="model"]');
            //    parent.find('li.list-group-custom-default').removeClass('active');
            //    for (var i = 0; i < vehicleSearchCriteria.Models.length; i++) {
            //        currentModel = vehicleSearchCriteria.Models[i];
            //        var currentLi = $('ul[data-type="model"]').find('li:not(.sublistItem)[value="' + currentModel + '"]');
            //        currentLi.addClass('active');
            //        currentLi.find('span:not(.badge)').addClass('glyphicon-minus').removeClass('glyphicon-plus');
            //        if (currentLi.attr('hassublist') == "True") {
            //            var currentId = currentLi.attr('parentid');
            //            searchControl.expandChildrenItem(parent, currentId);
            //        }
            //    }
            //}

            if (vehicleSearchCriteria.ModelTrims != null && vehicleSearchCriteria.ModelTrims.length > 0) {
                var currentModelTrim;
                var parentModelTrim = $('ul[data-type="model"]');
                parentModelTrim.find('li.list-group-custom-default').removeClass('active');
                for (var i = 0; i < vehicleSearchCriteria.ModelTrims.length; i++) {
                    currentModelTrim = vehicleSearchCriteria.ModelTrims[i];
                    var currentModelTrimLi = $('ul[data-type="model"]')
                        .find('li:not(.sublistItem)[value="' + currentModelTrim.modelId + '"]');
                    currentModelTrimLi.addClass('active');
                    currentModelTrimLi.find('span:not(.badge)')
                        .addClass('glyphicon-minus')
                        .removeClass('glyphicon-plus');
                    if (currentModelTrimLi.attr('hassublist') == "True") {
                        var currentModelTrimId = currentModelTrimLi.attr('parentid');
                        searchControl.expandChildrenItem(parentModelTrim, currentModelTrimId);
                        searchControl.expandSubChildItem(currentModelTrimId, currentModelTrim.trimId);
                    }
                }
            }

            if (vehicleSearchCriteria.BodyStyles != null && vehicleSearchCriteria.BodyStyles.length > 0) {
                var currentStyle;
                $('ul[data-type="style"]').find('li.list-group-custom-default').removeClass('active');
                for (var i = 0; i < vehicleSearchCriteria.BodyStyles.length; i++) {
                    currentStyle = vehicleSearchCriteria.BodyStyles[i];
                    $('ul[data-type="style"]').find('li[value="' + currentStyle + '"]').addClass('active');
                }
                vehicleSearchCriteria.IsSelectingBody = false;
            }

            if (vehicleSearchCriteria.Prices != null && vehicleSearchCriteria.Prices.length > 0) {
                var currentPrice;
                $('ul[data-type="price"]').find('li.list-group-custom-default').removeClass('active');
                for (var i = 0; i < vehicleSearchCriteria.Prices.length; i++) {
                    currentPrice = vehicleSearchCriteria.Prices[i];
                    $('ul[data-type="price"]').find('li[value="' + currentPrice + '"]').addClass('active');
                }
                vehicleSearchCriteria.IsSelectingPrice = false;
            }

            if (vehicleSearchCriteria.Years != null && vehicleSearchCriteria.Years.length > 0) {
                var currentYear;
                $('ul[data-type="year"]').find('li.list-group-custom-default').removeClass('active');
                for (var i = 0; i < vehicleSearchCriteria.Years.length; i++) {
                    currentYear = vehicleSearchCriteria.Years[i];
                    $('ul[data-type="year"]').find('li[value="' + currentYear + '"]').addClass('active');
                }
                vehicleSearchCriteria.IsSelectingYear = false;
            }

            if (vehicleSearchCriteria.Mileages != null && vehicleSearchCriteria.Mileages.length > 0) {
                var currentMilage;
                $('ul[data-type="mileage"]').find('li.list-group-custom-default').removeClass('active');
                for (var i = 0; i < vehicleSearchCriteria.Mileages.length; i++) {
                    currentMilage = vehicleSearchCriteria.Mileages[i];
                    $('ul[data-type="mileage"]').find('li[value="' + currentMilage + '"]').addClass('active');
                }
                vehicleSearchCriteria.IsSelectingMileage = false;
            }

            if (vehicleSearchCriteria.EngineTranslatedEngines != null &&
                vehicleSearchCriteria.EngineTranslatedEngines.length > 0) {
                var currentEngine;
                var parentEngineTranslated = $('ul[data-type="engine"]');
                parentEngineTranslated.find('li.list-group-custom-default').removeClass('active');
                for (var i = 0; i < vehicleSearchCriteria.EngineTranslatedEngines.length; i++) {
                    currentEngine = vehicleSearchCriteria.EngineTranslatedEngines[i];
                    var parentEngineTranslatedLi = $('ul[data-type="engine"]')
                        .find('li:not(.sublistItem)[value="' + currentEngine.engineTranslatedId + '"]');
                    parentEngineTranslatedLi.addClass('active');
                    parentEngineTranslatedLi.find('span:not(.badge)')
                        .addClass('glyphicon-minus')
                        .removeClass('glyphicon-plus');
                    if (parentEngineTranslatedLi.attr('hassublist') == "True") {
                        var currentEngineId = parentEngineTranslatedLi.attr('parentid');
                        searchControl.expandChildrenItem(parentEngineTranslated, currentEngineId);
                        searchControl.expandSubChildItem(currentEngineId, currentEngine.engineId);
                    }
                }
                vehicleSearchCriteria.IsSelectingEngine = false;
            }

            if (vehicleSearchCriteria.FuelTypes != null && vehicleSearchCriteria.FuelTypes.length > 0) {
                var currentFuel;
                $('ul[data-type="fuel"]').find('li.list-group-custom-default').removeClass('active');
                for (var i = 0; i < vehicleSearchCriteria.FuelTypes.length; i++) {
                    currentFuel = vehicleSearchCriteria.FuelTypes[i];
                    $('ul[data-type="fuel"]').find('li[value="' + currentFuel + '"]').addClass('active');
                }
                vehicleSearchCriteria.IsSelectingFuel = false;
            }

            if (vehicleSearchCriteria.Drives != null && vehicleSearchCriteria.Drives.length > 0) {
                var currentDrive;
                $('ul[data-type="drive"]').find('li.list-group-custom-default').removeClass('active');
                for (var i = 0; i < vehicleSearchCriteria.Drives.length; i++) {
                    currentDrive = vehicleSearchCriteria.Drives[i];
                    $('ul[data-type="drive"]').find('li[value="' + currentDrive + '"]').addClass('active');
                }
                vehicleSearchCriteria.IsSelectingDrive = false;
            }

            if (vehicleSearchCriteria.ExteriorColors != null && vehicleSearchCriteria.ExteriorColors.length > 0) {
                var currentColor;
                $('ul[data-type="color"]').find('li.list-group-custom-default').removeClass('active');
                for (var i = 0; i < vehicleSearchCriteria.ExteriorColors.length; i++) {
                    currentColor = vehicleSearchCriteria.ExteriorColors[i];
                    $('ul[data-type="color"]').find('li[value="' + currentColor + '"]').addClass('active');
                }
                vehicleSearchCriteria.IsSelectingColor = false;
            }

            if (!siteMaster.isMobile()) {
                if (vehicleSearchCriteria.IsExpandType ||
                    vehicleSearchCriteria.IsExpandModel ||
                    vehicleSearchCriteria.IsExpandBodyStyle) {
                    if (vehicleSearchCriteria.IsExpandModel) {
                        if (!$('a[href="#collapseModel"] span').hasClass('glyphicon-minus'))
                            $('a[href="#collapseModel"]').click();
                    }
                    if (vehicleSearchCriteria.IsExpandBodyStyle) {
                        if (!$('a[href="#collapseStyle"] span').hasClass('glyphicon-minus'))
                            $('a[href="#collapseStyle"] span').click();
                    }
                }
                if (vehicleSearchCriteria.Makes != null && vehicleSearchCriteria.Makes.length > 0) {
                    if (!$('a[href="#collapseMake"] span').hasClass('glyphicon-minus'))
                        $('a[href="#collapseMake"] span').click();
                }
                if (vehicleSearchCriteria.Prices != null && vehicleSearchCriteria.Prices.length > 0) {
                    if (!$('a[href="#collapsePrice"] span').hasClass('glyphicon-minus'))
                        $('a[href="#collapsePrice"] span').click();
                }
                if (vehicleSearchCriteria.Years != null && vehicleSearchCriteria.Years.length > 0) {
                    if (!$('a[href="#collapseYear"] span').hasClass('glyphicon-minus'))
                        $('a[href="#collapseYear"] span').click();
                }
                if (vehicleSearchCriteria.Mileages != null && vehicleSearchCriteria.Mileages.length > 0) {
                    if (!$('a[href="#collapseMile"] span').hasClass('glyphicon-minus'))
                        $('a[href="#collapseMile"] span').click();
                }
                if (vehicleSearchCriteria.EngineTranslatedEngines != null &&
                    vehicleSearchCriteria.EngineTranslatedEngines.length > 0) {
                    if (!$('a[href="#collapseEngine"] span').hasClass('glyphicon-minus'))
                        $('a[href="#collapseEngine"] span').click();
                }
                if (vehicleSearchCriteria.FuelTypes != null && vehicleSearchCriteria.FuelTypes.length > 0) {
                    if (!$('a[href="#collapseFuel"] span').hasClass('glyphicon-minus'))
                        $('a[href="#collapseFuel"] span').click();
                }
                if (vehicleSearchCriteria.Drives != null && vehicleSearchCriteria.Drives.length > 0) {
                    if (!$('a[href="#collapseDrive"] span').hasClass('glyphicon-minus'))
                        $('a[href="#collapseDrive"] span').click();
                }
                if (vehicleSearchCriteria.ExteriorColors != null && vehicleSearchCriteria.ExteriorColors.length > 0) {
                    if (!$('a[href="#collapseColor"] span').hasClass('glyphicon-minus'))
                        $('a[href="#collapseColor"] span').click();
                }
            }
        }
    },
    expandSubChildItem: function (parentId, childId) {
        $('div.list-group-submenu[id="' + parentId + '"] li[value="' + childId + '"]').addClass('active');
    },
    expandChildrenItem: function (parent, parentId) {
        if ($(parent).find('li[parentId="' + parentId + '"]').hasClass('active')) {
            $(parent).find('.list-group-submenu[id="' + parentId + '"]').addClass('in');
        }
    },
    setDefaultMasterDataCounter: function () {
        var defaultMasterDataCounter = $('[id$="defaultMasterDataCounter"]').val();
        vehicleMasterDataCounter = $.parseJSON(defaultMasterDataCounter);
    },
    setDefaultSelectedItems: function () {
    },
    
    preventPagingToPostBack: function () {
        $(document).on('click', 'ul.pagination.bootpag li a', function (e) {
            var that = $(this);
            var currentPage = $('[id$="currentPage"]').val();
            var currentHref = siteMaster.currentUrl() + location.pathname + searchControl.modifyUrlByQuerySearchString() + siteMaster.formatedQueryStringQuote() + 'page=' + currentPage;
            console.log(currentHref);
            e.preventDefault();
            window.history.pushState(null, null, currentHref);
        });
    },
    checkIsLoadingNewPage: function () {
        //if (window.location.search.indexOf('page') == -1) {
        //    localStorage.setItem('SearchData', '');
        //    localStorage.setItem('SearchDataText', '');
        //}
    },
    registerEvents: function () {
        $('#ddlSort').change(function (index, item) {
            var that = $(this);
            searchControl.reloadData();
        });

        $('.checkboxes.model-list-categories').each(function (index, item) {
            var that = $(this);
            var height = that.height();
            if (height > 100) {
                var defaultHeight = height / 3;
                var actualHeight = defaultHeight + (((defaultHeight / 100) * 30));
                that.height(actualHeight);
            }
        });

        if ($('[id$="IsSetPagingVisible"]').val() === 'false') {
            $('.vsr-pagenation').hide();
        }

        searchControl.registerButtonsClick();
        searchControl.registerScrollEvent();
        searchControl.registerEventForPriceAndRebate();
    },
    modifyUrlByQuerySearchString: function () {
        var result = '';
        var defaultTextSearch = $('[id$="HdfSearchText"]').val();
        if (typeof defaultTextSearch != "undefined" && defaultTextSearch != null && defaultTextSearch != '') {
            var temp = defaultTextSearch.replace(' ', '+');
            result = '?keywords=' + temp;
        }
        return result;
    },
    modifyUrlForPageOne: function() {
        var result = '';
        var currentQueryString = location.href;
        if (typeof currentQueryString != "undefined" && currentQueryString != null && currentQueryString != '') {
            if (currentQueryString.indexOf('page') == -1) {
                result = 'page=1';
            }
        }
        return result;
    },
    modifyPagingRel: function () {
        $('ul.pagination.bootpag li a').each(function (index, item) {
            var that = $(this);
            var currentLi = that.closest('li');
            if (currentLi.hasClass('next')) {
                currentLi.attr('rel', 'next');
            }
            if (currentLi.hasClass('prev')) {
                currentLi.attr('rel', 'prev');
            }
        });
    },

    resetToPageOne: function () {
        $(currentPagingTop).find('li.active').removeClass('active');
        $(currentPagingBottom).find('li.active').removeClass('active');
        $(currentPagingTop).find('li[data-lp="1"]:not(.prev)').addClass('active');
        $(currentPagingBottom).find('li[data-lp="1"]:not(.prev)').addClass('active');
        $('[id$="currentPage"]').val("1");
        $('#pageNumber').attr('currentPage', '1');
        var originalUrl = siteMaster.currentUrl() + location.pathname;
        var params = {};

        var defaultTextSearch = $('[id$="HdfSearchText"]').val();
        if (typeof defaultTextSearch != "undefined" && defaultTextSearch != null && defaultTextSearch != '') {
            var temp = defaultTextSearch.replace(' ', '+');
            params.keywords = temp;
        }

        params.page = 1;
        
        var currentHref = originalUrl + "?" + decodeURIComponent($.param(params));
        window.history.replaceState(null, null, currentHref);
    },
    disableAndSetDefaultForPaging: function () {
        searchControl.resetToPageOne();
        $('ul.pagination li:not(.prev)').toggleClass('disabled');
    },
    registerButtonsClick: function () {
        $('#txtSearch').on('keypress', function (e) {
            var searchText = $('#txtSearch').val();
            searchText = $.trim(searchText);

            if (e.keyCode == 13) {
                $('#txtSearch').val(searchText);
                vehicleSearchCriteria.Vin = $.trim(searchText);
                //reloadTriggerScrollPosition = 0;
                searchControl.reloadData();
            }

        });
        $('#btnSearchVin').click(function () {
            var that = $(this);
            var searchText = $('#txtSearch').val();
            searchText = $.trim(searchText);
            $('#txtSearch').val(searchText);
            if (typeof searchText != "undefined" && searchText != '') {
                vehicleSearchCriteria.Vin = $.trim(searchText);
            }
            reloadTriggerScrollPosition = 0;
            searchControl.reloadData();
        });
        $('#newSearch').click(function () {
            $.extend(true, defaultVehicleSearchCriteria, vehicleSearchCriteria);
            searchControl.setDefaultFilter();
        });

        $("[name='my-checkbox']").bootstrapSwitch();

        $('input[name="my-checkbox"]').on('switchChange.bootstrapSwitch', function (event, state) {
            vehicleSearchCriteria.IsViewAll = state;
            //searchControl.resetToPageOne();
            reloadTriggerScrollPosition = 0;


            if (vehicleSearchCriteria.IsViewAll) {
                $('[id$="pageSize"]').val(allPageSize);
            } else {
                $('[id$="pageSize"]').val(defaultPageSize);
            }


            searchControl.reloadData();
            $("[name='my-checkbox']").bootstrapSwitch(state);
            searchControl.disableAndSetDefaultForPaging();
        });

        $('span.parentItem').on('click', function (e) {
            var that = $(this);
            that.closest('li').click();
        });

        $('a[data-toggle]').on('click', function (e) {
            var that = $(this);

            var child = that.children('span');
            if (!child.hasClass('glyphicon-minus')) {
                child.addClass('glyphicon-minus').removeClass('glyphicon-plus');
            } else {
                child.removeClass('glyphicon-minus').addClass('glyphicon-plus');
            }
        });


        $('.list-group-item').on('click', function (e) {
            var that = $(this);
            var hasSubList = that.attr('hassublist') == "True";
            var isSubList = that.hasClass('sublistItem');
            var parentId = that.attr('parentid');
            var ul = that.closest('ul');
            var type = ul.data('type');
            if ($(e.target).is('span.glyphicon')) {
                return;
            }

            var parent = that.closest(".list-group");

            if ($(e.target).hasClass('active')) {
                $(e.target).removeClass('active');
                if (hasSubList) {
                    parent.find('div[id="' + parentId + '"] li').removeClass('active');
                }
            } else {
                $(e.target).addClass('active');
            }

            var child = that.children('span.glyphicon');
            if (!that.hasClass('active')) {
                if (!child.hasClass('glyphicon-minus')) {
                    child.addClass('glyphicon-minus').removeClass('glyphicon-plus');
                } else {
                    child.removeClass('glyphicon-minus').addClass('glyphicon-plus');
                }
            } else {
                child.addClass('glyphicon-minus').removeClass('glyphicon-plus');
            }

            if (!that.hasClass('list-group-custom-default')) {
                parent.find('.list-group-custom-default').removeClass("active");
            } else {
                parent.find('.list-group-item').removeClass("active");
                parent.find('span.glyphicon').removeClass('glyphicon-minus').addClass('glyphicon-plus');
                parent.find('.list-group-submenu').removeClass('in');
            }

            //Check if parent of sublist has not checked then check it
            if (isSubList) {
                var divParentId = that.closest('div.list-group-submenu').attr('id');
                var parentOfSubList = parent.find('li[parentId="' + divParentId + '"]');
                if (!$(parentOfSubList).hasClass('active')) {
                    $(parentOfSubList).addClass('active');
                }
            }

            if (!isSubList && hasSubList) {
                if ($(parent).find('li[parentId="' + parentId + '"]').hasClass('active'))
                    $(parent).find('.list-group-submenu[id="' + parentId + '"]').addClass('in');
                else
                    $(parent).find('.list-group-submenu[id="' + parentId + '"]').removeClass('in');
            }

            //No Selected
            if (parent.find('.list-group-item.active').length == 0) {
                parent.find('.list-group-custom-default').addClass("active");
            }
            searchControl.setSelectingFlagToDefault();
            if (!that.hasClass('list-group-custom-default')) {
                searchControl.setSelectingFlag(type);
            }
            searchControl.resetToPageOne();
            searchControl.reloadData();
        });

        $('span.badge').click(function () {
            var that = $(this);
            that.closest('li').click();
        });

        $('.non-pagenation').click(function () {
            var that = $(this);
            //vehicleSearchCriteria.IsViewAll = true;
            //searchControl.reloadData();
        });

        $(document).on('click', '#btnCloseRebate', function () {
            $('#ucRebate').dialog('close');
        });

        $('#new-vehicle').on('click', '.openRebate', function () {
            var that = $(this);
            $('#ucRebate').dialog({
                dialogClass: "no-close no-title",
                modal: true,
                closeOnEscape: true,
                position: { my: "center", at: "center", of: window },
                width: "945",
                //height: "auto",
                show: { effect: "fade", duration: 500 },
                bgiframe: true,
                open: function () {
                    if (typeof rebateControl != "undefined" && rebateControl != null) {
                        var agileVehicleId = that.attr('id');
                        rebateControl.loadRebateForVehicle(agileVehicleId);
                    }
                    $("#ui-dialog-title-dialog").hide();
                    $(".ui-dialog-titlebar").removeClass('ui-widget-header');
                    $(".ui-dialog-titlebar").hide();
                },
                close: function () {
                }
            });
        });
    },
    setSelectingFlagToDefault: function () {
        vehicleSearchCriteria.IsSelectingPrice = false;
        vehicleSearchCriteria.IsSelectingYear = false;
        vehicleSearchCriteria.IsSelectingMake = false;
        vehicleSearchCriteria.IsSelectingBody = false;
        vehicleSearchCriteria.IsSelectingFuel = false;
        vehicleSearchCriteria.IsSelectingColor = false;
        vehicleSearchCriteria.IsSelectingEngine = false;
        vehicleSearchCriteria.IsSelectingDrive = false;
        vehicleSearchCriteria.IsSelectingTrim = false;
        vehicleSearchCriteria.IsSelectingMileage = false;
    },
    setSelectingFlag: function (currentSelectingCategory) {
        if (typeof currentSelectingCategory != "undefined" && currentSelectingCategory != null) {
            switch (currentSelectingCategory) {
                case 'style':
                    vehicleSearchCriteria.IsSelectingBody = true;
                    break;
                case 'price':
                    vehicleSearchCriteria.IsSelectingPrice = true;
                    break;
                case 'make':
                    vehicleSearchCriteria.IsSelectingMake = true;
                    break;
                case 'year':
                    vehicleSearchCriteria.IsSelectingYear = true;
                    break;
                case 'fuel':
                    vehicleSearchCriteria.IsSelectingFuel = true;
                    break;
                case 'color':
                    vehicleSearchCriteria.IsSelectingColor = true;
                    break;
                case 'engine':
                    vehicleSearchCriteria.IsSelectingEngine = true;
                    break;
                case 'drive':
                    vehicleSearchCriteria.IsSelectingDrive = true;
                    break;
                case 'mileage':
                    vehicleSearchCriteria.IsSelectingMileage = true;
                    break;
                default:
                    break;
            }
        }
    },
    setPriceBackToNormal: function (type) {
        var ul = $('ul[data-type="' + type + '"]');
        var defaultItem = $(ul).find('li.list-group-custom-default').addClass('active');
        var childItem = $(ul).find('li.list-group-item:not(.list-group-custom-default)').removeClass('active');

    },
    setAllBackToNormal: function (type) {
        var ul = $('ul.list-group:not([data-type="type"]):not([data-type="model"])');
        $.each(ul, function () {
            var that = $(this);
            var selectedItems = that.find('li:not(.list-group-custom-default).active');
            if (selectedItems.length == 0) {
                var defaultItem = $(that).find('li.list-group-custom-default').addClass('active');
                var childItem = $(that).find('li.list-group-item:not(.list-group-custom-default)').removeClass('active');
            }
        });


    },
    setReloadTriggerScrollPosition: function () {

        if (vehicleSearchCriteria.IsViewAll) {
            $(window).scrollTop(reloadTriggerScrollPosition);
            var vehicleDisplays = $('#vehicleList .panel');
            var numVehiclesOnDisplay = vehicleDisplays.length;
            shouldGetMoreDataOnScroll = totalResultSet > numVehiclesOnDisplay;
            var thirdLastEntry = numVehiclesOnDisplay > 1 ? vehicleDisplays[numVehiclesOnDisplay - 1] : 0;
            reloadTriggerScrollPosition = $(thirdLastEntry).position().top;
        }

    },
    debounce: function (func, wait, immediate) {
        var timeout;
        return function () {
            var context = this, args = arguments;
            var later = function () {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            var callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    },
    scrollMoved: function () {
        var currentScrollPosition = $(window).scrollTop();
        if (reloadTriggerScrollPosition <= currentScrollPosition && vehicleSearchCriteria.IsViewAll && shouldGetMoreDataOnScroll) {//Force Reload
            var hidPageNumber = $('#pageNumber');
            var currentPage = searchControl.tryParseValue(hidPageNumber.attr('currentPage'));
            currentPage = currentPage + 1;
            hidPageNumber.attr('currentPage', currentPage);
            $('[id$="currentPage"]').val(currentPage);
            searchControl.reloadData();
        }
    },
    registerScrollEvent: function () {
        $(window).on('scroll', searchControl.debounce(searchControl.scrollMoved, 250));
    },
    registerEventForPriceAndRebate: function () {
        $('.price').each(function (index, item) {
            var price = searchControl.tryParseValue($(item).attr('value'));
            if (price == 0) {
                $(item).text("Call");
            }
        });

        $('.rebate').each(function (index, item) {
            var text = $(item).text();
            var replacedText = text.replace('(', '').replace(')', '');
            var tryText = replacedText.replace('$', '').replace('-', '');
            if (searchControl.tryParseValue(tryText) != 0) {
                $(item).text(replacedText);
            } else {
                $(item).closest('.rebateDiv').hide();
            }
        });

    },
    reloadData: function () {
        searchControl.addSelectedValueToCriteria();
        searchControl.getVehicleData();
    },
    getVehicleSearchCriteria: function () {
        var vehicleFilter = {
            VehicleSearchCriteria: vehicleSearchCriteria,
            VehicleMasterDataCounter: vehicleMasterDataCounter
        };
        return vehicleFilter;
    },
    getVehicleData: function () {
        var data = searchControl.getVehicleSearchCriteria();
        searchControl.unmaskedInput();

        $.blockUI(siteMaster.loadingWheel());
        $.ajax({
            url: siteMaster.currentUrl() + '/Controllers/SearchController.ashx?method=' + 'GetVehicles',
            type: 'POST',
            async: true,
            dataType: "json",
            contentType: "application/json",
            cache: false,
            timeout: 300000,
            data: JSON.stringify(data),
            success: function (dataResult) {
                if (dataResult.isSuccess === true) {
                    var canbeEdit = $('[id$="CanBeEdit"]').val() == "True";
                    if (!dataResult.criteria.IsViewAll) {
                        $('#vehicleList').empty();
                    } else {
                        if (dataResult.criteria.PageNumber == 1)
                            $('#vehicleList').empty();
                    }
                    $('[id$="total"]').val(dataResult.totalPage);
                    if (dataResult.vehicleList != null) {
                        var total = dataResult.vehicleList.length;
                        for (var i = 0; i < total; i++) {
                            var currentItem = dataResult.vehicleList[i];
                            currentItem.IsDisplayMRSP = currentItem.MSRP == 0 || (currentItem.MSRP == currentItem.SellingPrice) ? "hidden" : "";
                            currentItem.Rebate = currentItem.Rebate.toString().replace('-', '');
                            currentItem.IsDisplayRebate = currentItem.Rebate == 0 ? "hidden" : "";
                            currentItem.IsDisplayDealerSaving = currentItem.DealerSaving == 0 ? "hidden" : "";
                            currentItem.SellingPrice = currentItem.SellingPrice == 0 ? "Call" : currentItem.SellingPrice = '$' + currentItem.SellingPrice;
                            if (currentItem.DealerSaving != 0)
                                currentItem.DealerSaving = '-$' + currentItem.DealerSaving.toString().replace('-', '');
                            var url = '/vehicle-info/' + currentItem.Year + '-' + currentItem.Make.toLowerCase() + '-' + currentItem.ModelFormated.toLowerCase() + '-' + currentItem.Vin.toLowerCase();
                            currentItem.VehicleInfoUrl = siteMaster.currentUrl() + url;
                            currentItem.EditUrl = siteMaster.currentUrl() + '/admin/vehicleEdit/' + currentItem.Vin;
                            currentItem.Trim = currentItem.Trim == "Other" ? '' : currentItem.Trim;
                            currentItem.IsDisplayMPG = (currentItem.MPGCity == 0 || currentItem.MPGHighway == 0) ? "hidden" : "";

                            currentItem.IsDisplayExtColor = currentItem.IsNew ? "" : "hidden";
                            currentItem.IsDisplayMileage = !currentItem.IsNew ? "" : "hidden";
                            currentItem.Mileage = searchControl.formatThousand(currentItem.Mileage);
                            currentItem.IsDisplayEditButton = !canbeEdit ? "hidden" : "";
                            var today = new Date();
                            if (currentItem.IsOverridePrice && (!currentItem.HasSetDateRange || (new Date(currentItem.OverrideStartDate) <= today && today <= new Date(currentItem.OverrideEndDate)))) {
                                currentItem.SellingPrice = currentItem.SellingPrice;
                                currentItem.IsDisplayMRSP = "hidden";
                                currentItem.IsDisplayDealerSaving = "hidden";
                                currentItem.IsDisplayRebate = "hidden";
                            }


                            $.tmpl($('#vehicleListTemplate'), currentItem).appendTo('#vehicleList');
                        }
                    }

                    searchControl.setTotalCount(dataResult.totalRecord);
                    var isShow = (dataResult.totalRecord >= dataResult.criteria.PageSize);
                    if (dataResult.criteria.IsViewAll) {
                        isShow = false;
                    }
                    searchControl.displayPagination(isShow);
                    vehicleMasterDataCounter = dataResult.masterDataCounter;
                    searchControl.setDefaultMasked();
                    searchControl.setPaginationTotal();
                    searchControl.hideSearchMessageIfNoResultFound(dataResult.totalRecord);
                    searchControl.getCounterForVehicle(data);
                    searchControl.setReloadTriggerScrollPosition();
                    searchControl.modifyPagingRel();
                }
            },
            error: function () {
                $.unblockUI(siteMaster.loadingWheel());
                alert("Error when contacting to server, please try again later!");
            }
        });
    },
    getCounterForVehicle: function (data) {
        $.ajax({
            url: siteMaster.currentUrl() + '/Controllers/SearchController.ashx?method=' + 'GetCounter',
            type: 'POST',
            async: true,
            dataType: "json",
            contentType: "application/json",
            cache: false,
            timeout: 300000,
            data: JSON.stringify(data),
            success: function (dataResult) {
                if (dataResult.isSuccess === true) {
                    searchControl.setCounterForFilter(dataResult.masterDataCounter, dataResult.criteria);
                    searchControl.hideTypeIfNowResultFound();
                    searchControl.hideModelIsNoResultFound();
                    searchControl.hideFilterIfNoResultFound();
                    $.unblockUI(siteMaster.loadingWheel());
                }
            },
            error: function () {
                $.unblockUI(siteMaster.loadingWheel());
                alert("Error when contacting to server, please try again later!");
            }
        });
    },
    hideSearchMessageIfNoResultFound: function (count) {
        var total = searchControl.tryParseValue(count);
        if (total > 0) {
            $('#search-res-msg').addClass('hidden');
        } else {
            var searchText = $('#txtSearch').val();
            if (searchText == '' || searchText == null) {
                $('#search-res-msg').addClass('hidden');
            } else {
                $('#search-res-msg').removeClass('hidden');
            }
        }
    },
    hideTypeIfNowResultFound: function () {
        var newCount = $('ul[data-type="type"]').find('li[value="new"]');
        var usedCount = $('ul[data-type="type"]').find('li[value="used"]');
        var certitiedCount = $('ul[data-type="type"]').find('li[value="certified"]');
        var liftCount = $('ul[data-type="lift"]').find('li[value="isLift"]');

        if (newCount.find('span.badge').text() == 0) {
            newCount.hide();
        } else {
            newCount.show();
        }

        if (usedCount.find('span.badge').text() == 0) {
            usedCount.hide();
        } else {
            usedCount.show();
        }

        if (certitiedCount.find('span.badge').text() == 0) {
            certitiedCount.hide();
        } else {
            certitiedCount.show();
        }

        if (liftCount.find('span.badge').text() == 0) {
            liftCount.hide();
        } else {
            liftCount.show();
        }
    },
    hideFilterIfNoResultFound: function () {
        $('span.badge:not([isChildCount="true"]):not([isParentModelCount="true"])').each(function (index, item) {
            var that = $(this);
            var parent = that.closest('li.list-group-item');
            //var topParent = parent.closest('ul.list-group');
            //if (topParent)
            if (that.text() == 0) {
                parent.hide();
            } else {
                parent.show();
            }
        });
    },
    hideModelIsNoResultFound: function () {
        $('span[isParentModelCount="true"]').each(function (index, item) {
            var that = $(this);
            var parent = that.closest('li.list-group-item');
            var child = $('div[id="' + parent.attr('parentid') + '"]');
            if (that.text() == 0) {
                parent.hide();
                $(child).removeClass('in');
            } else {
                parent.show();
            }
        });

        $('span[isChildCount="true"]').each(function (index, item) {
            var that = $(this);
            var parent = that.closest('li.sublistItem');
            if (that.text() == 0) {
                parent.hide();
            } else {
                parent.show();
            }
        });
    },
    setTotalCount: function (total) {
        totalResultSet = total;
        var msg;
        if (total > 1) {
            msg = total + " Vehicles Found";
        } else {
            msg = total + " Vehicle Found";
        }
        $('#lblCount').text(msg);
    },
    setCounterForFilter: function (masterDataCounter, criteria) {
        if (typeof masterDataCounter != "undefined" && masterDataCounter != null) {
            $('ul[data-type="type"]').find('li[value="new"] span.badge').text(masterDataCounter.IsNew);
            $('ul[data-type="type"]').find('li[value="used"] span.badge').text(masterDataCounter.IsUsed);
            $('ul[data-type="type"]').find('li[value="certified"] span.badge').text(masterDataCounter.IsCertified);
            $('ul[data-type="type"]').find('li.list-group-custom-default span.badge').text(masterDataCounter.IsNew + masterDataCounter.IsCertified + masterDataCounter.IsUsed);

            $('ul[data-type="lift"]').find('li.list-group-custom-default span.badge').text(masterDataCounter.IsLift);
            $('ul[data-type="lift"]').find('li[value="isLift"] span.badge').text(masterDataCounter.IsLift);

            if (!criteria.IsSelectingYear) {
                if (masterDataCounter.Years.length !== 0) {
                    var count = masterDataCounter.Years.length;
                    var sum = 0;
                    for (var i = 0; i < count; i++) {
                        sum += masterDataCounter.Years[i].Count;
                        searchControl.setValueForSelectedItemsByTypeAndId('year', masterDataCounter.Years[i].Id, masterDataCounter.Years[i].Count);
                    }
                    $('ul[data-type="year"]').find('li.list-group-custom-default span.badge').text(sum);
                }
            }
            if (!criteria.IsSelectingMake) {
                if (masterDataCounter.Makes.length !== 0) {
                    var count = masterDataCounter.Makes.length;
                    var sum = 0;
                    for (var i = 0; i < count; i++) {
                        sum += masterDataCounter.Makes[i].Count;
                        searchControl.setValueForSelectedItemsByTypeAndId('make', masterDataCounter.Makes[i].Id, masterDataCounter.Makes[i].Count);
                    }
                    $('ul[data-type="make"]').find('li.list-group-custom-default span.badge').text(sum);
                }
            }

            if (!criteria.IsSelectingPrice) {
                if (masterDataCounter.Prices.length !== 0) {
                    var count = masterDataCounter.Prices.length;
                    var sum = 0;
                    for (var i = 0; i < count; i++) {
                        sum += masterDataCounter.Prices[i].Count;
                        searchControl.setValueForSelectedItemsByTypeAndId('price', masterDataCounter.Prices[i].Id, masterDataCounter.Prices[i].Count);
                    }
                    $('ul[data-type="price"]').find('li.list-group-custom-default span.badge').text(sum);
                }
            }


            if (masterDataCounter.Models.length !== 0) {
                var count = masterDataCounter.Models.length;
                var sum = 0;
                for (var i = 0; i < count; i++) {
                    var parent = searchControl.getParentIdByTypeAndId('model', masterDataCounter.Models[i].Id);
                    sum += masterDataCounter.Models[i].Count;
                    searchControl.setValueForSelectedItemsByTypeAndId('model', masterDataCounter.Models[i].Id, masterDataCounter.Models[i].Count);
                    var subList = masterDataCounter.Models[i].SubList;
                    if (typeof subList != "undefined" && subList != null) {
                        for (var j = 0; j < subList.length; j++) {
                            searchControl
                                .setValueForSelectedItemsOfSubMenuByTypeAndId('model',
                                    $(parent).attr('parentid'),
                                    masterDataCounter.Models[i].SubList[j].SubListId,
                                    masterDataCounter.Models[i].SubList[j].Count);
                        }
                    }
                }
                $('ul[data-type="model"]').find('li.list-group-custom-default span.badge').text(sum);
            }

            if (masterDataCounter.Engines.length !== 0) {
                var count = masterDataCounter.Engines.length;
                var sum = 0;
                //for (var i = 0; i < count; i++) {
                //    sum += masterDataCounter.Engines[i].Count;
                //    searchControl.setValueForSelectedItemsByTypeAndId('engine', masterDataCounter.Engines[i].Id, masterDataCounter.Engines[i].Count);
                //}
                //$('ul[data-type="engine"]').find('li.list-group-custom-default span.badge').text(sum);


                for (var i = 0; i < count; i++) {
                    var parent = searchControl.getParentIdByTypeAndId('engine', masterDataCounter.Engines[i].Id);
                    sum += masterDataCounter.Engines[i].Count;
                    searchControl.setValueForSelectedItemsByTypeAndId('engine', masterDataCounter.Engines[i].Id, masterDataCounter.Engines[i].Count);
                    var subList = masterDataCounter.Engines[i].SubList;
                    if (typeof subList != "undefined" && subList != null) {
                        for (var j = 0; j < subList.length; j++) {
                            searchControl.setValueForSelectedItemsOfSubMenuByTypeAndId('engine', $(parent).attr('parentid'), masterDataCounter.Engines[i].SubList[j].SubListId, masterDataCounter.Engines[i].SubList[j].Count);
                        }
                    }
                }
                $('ul[data-type="engine"]').find('li.list-group-custom-default span.badge').text(sum);
            }

            if (!criteria.IsSelectingBody) {
                if (masterDataCounter.BodyStyles.length !== 0) {
                    var count = masterDataCounter.BodyStyles.length;
                    var sum = 0;
                    for (var i = 0; i < count; i++) {
                        sum += masterDataCounter.BodyStyles[i].Count;
                        searchControl.setValueForSelectedItemsByTypeAndId('style', masterDataCounter.BodyStyles[i].Id, masterDataCounter.BodyStyles[i].Count);
                    }
                    $('ul[data-type="style"]').find('li.list-group-custom-default span.badge').text(sum);
                }
            }

            if (!criteria.IsSelectingColor) {
                if (masterDataCounter.ExteriorColors.length !== 0) {
                    var count = masterDataCounter.ExteriorColors.length;
                    var sum = 0;
                    for (var i = 0; i < count; i++) {
                        sum += masterDataCounter.ExteriorColors[i].Count;
                        searchControl.setValueForSelectedItemsByTypeAndId('color', masterDataCounter.ExteriorColors[i].Id, masterDataCounter.ExteriorColors[i].Count);
                    }
                    $('ul[data-type="color"]').find('li.list-group-custom-default span.badge').text(sum);
                }
            }
            if (!criteria.IsSelectingFuel) {
                if (masterDataCounter.FuelTypes.length !== 0) {
                    var count = masterDataCounter.FuelTypes.length;
                    var sum = 0;
                    for (var i = 0; i < count; i++) {
                        sum += masterDataCounter.FuelTypes[i].Count;
                        searchControl.setValueForSelectedItemsByTypeAndId('fuel', masterDataCounter.FuelTypes[i].Id, masterDataCounter.FuelTypes[i].Count);
                    }
                    $('ul[data-type="fuel"]').find('li.list-group-custom-default span.badge').text(sum);
                }
            }


            if (!criteria.IsSelectingDrive) {
                if (masterDataCounter.Drives.length !== 0) {
                    var count = masterDataCounter.Drives.length;
                    var sum = 0;
                    for (var i = 0; i < count; i++) {
                        sum += masterDataCounter.Drives[i].Count;
                        searchControl.setValueForSelectedItemsByTypeAndId('drive', masterDataCounter.Drives[i].Id, masterDataCounter.Drives[i].Count);
                    }
                    $('ul[data-type="drive"]').find('li.list-group-custom-default span.badge').text(sum);
                }
            }

            if (!criteria.IsSelectingMileage) {
                if (masterDataCounter.Mileages.length !== 0) {
                    var count = masterDataCounter.Mileages.length;
                    var sum = 0;
                    for (var i = 0; i < count; i++) {
                        sum += masterDataCounter.Mileages[i].Count;
                        searchControl.setValueForSelectedItemsByTypeAndId('mile', masterDataCounter.Mileages[i].Id, masterDataCounter.Mileages[i].Count);
                    }
                    $('ul[data-type="mile"]').find('li.list-group-custom-default span.badge').text(sum);
                }
            }
        }
    },
    addSelectedValueToCriteria: function () {
        vehicleSearchCriteria.Vin = $('#txtSearch').val();

        vehicleSearchCriteria.IsNew = typeof $('ul[data-type="type"]').find('li.active[value="new"]').attr('value') != "undefined" ? true : false;
        vehicleSearchCriteria.IsUsed = typeof $('ul[data-type="type"]').find('li.active[value="used"]').attr('value') != "undefined" ? true : false;
        vehicleSearchCriteria.IsCertified = typeof $('ul[data-type="type"]').find('li.active[value="certified"]').attr('value') != "undefined" ? true : false;
        vehicleSearchCriteria.IsLift = typeof $('ul[data-type="lift"]').find('li.active[value="isLift"]').attr('value') != "undefined" ? true : false;

        vehicleSearchCriteria.SortItem = $('#ddlSort').val();

        vehicleSearchCriteria.Years = [];
        var years = searchControl.getSelectedItemsByType('year');
        if (years.length !== 0) {
            for (var i = 0; i < years.length; i++) {
                vehicleSearchCriteria.Years.push($(years[i]).attr('value'));
            }
        }

        //vehicleSearchCriteria.RemainingYears = [];
        //var remainingYears = searchControl.getRemainingSelectedItemsByType('year');
        //if (remainingYears.length !== 0) {
        //    for (var i = 0; i < remainingYears.length; i++) {
        //        vehicleSearchCriteria.RemainingYears.push($(remainingYears[i]).attr('value'));
        //    }
        //}


        vehicleSearchCriteria.Makes = [];
        var makes = searchControl.getSelectedItemsByType('make');
        if (makes.length !== 0) {
            for (var i = 0; i < makes.length; i++) {
                vehicleSearchCriteria.Makes.push($(makes[i]).attr('value'));
            }
        }

        //vehicleSearchCriteria.RemainingMakes = [];
        //var remainingMakes = searchControl.getRemainingSelectedItemsByType('make');
        //if (remainingMakes.length !== 0) {
        //    for (var i = 0; i < remainingMakes.length; i++) {
        //        vehicleSearchCriteria.RemainingMakes.push($(remainingMakes[i]).attr('value'));
        //    }
        //}


        vehicleSearchCriteria.Prices = [];
        var prices = searchControl.getSelectedItemsByType('price');
        if (prices.length !== 0) {
            for (var i = 0; i < prices.length; i++) {
                vehicleSearchCriteria.Prices.push($(prices[i]).attr('value'));
            }
        }

        //vehicleSearchCriteria.RemainingPrices = [];
        //var remainingPrices = searchControl.getRemainingSelectedItemsByType('price');
        //if (remainingPrices.length !== 0) {
        //    for (var i = 0; i < remainingPrices.length; i++) {
        //        vehicleSearchCriteria.RemainingPrices.push($(remainingPrices[i]).attr('value'));
        //    }
        //}

        vehicleSearchCriteria.ModelTrims = [];
        var models = searchControl.getSelectedItemsByType('model');
        if (models.length !== 0) {
            for (var i = 0; i < models.length; i++) {
                var parentId = $(models[i]).attr('parentid');
                var hasSubList = $(models[i]).attr('hassublist') == "True";
                var modelId = $(models[i]).attr('value');
                var model = {
                    modelId: modelId,
                    trimId: 0
                };

                if (hasSubList) {
                    var sublist = searchControl.getSelectedSubItemByTypeAndId('model', parentId);
                    if (sublist.length != 0) {
                        for (var j = 0; j < sublist.length; j++) {
                            var newModel = {
                                modelId: modelId,
                                trimId: $(sublist[j]).attr('value')
                            }
                            vehicleSearchCriteria.ModelTrims.push(newModel);
                        }
                    } else {
                        vehicleSearchCriteria.ModelTrims.push(model);
                    }
                } else {
                    vehicleSearchCriteria.ModelTrims.push(model);
                }
            }
        } else {
            if (vehicleSearchCriteria.InLitmitedMode) {
                vehicleSearchCriteria.ModelTrims = [];
                var remainingModels = searchControl.getRemainingSelectedItemsByType('model');
                if (remainingModels.length !== 0) {
                    for (var i = 0; i < remainingModels.length; i++) {
                        var model = {
                            modelId: $(remainingModels[i]).attr('value'),
                            trimId: 0
                        };
                        vehicleSearchCriteria.ModelTrims.push(model);
                    }
                }
            }
        }


        vehicleSearchCriteria.EngineTranslatedEngines = [];
        var engines = searchControl.getSelectedItemsByType('engine');
        if (engines.length !== 0) {
            for (var i = 0; i < engines.length; i++) {
                var parentId = $(engines[i]).attr('parentid');
                var hasSubList = $(engines[i]).attr('hassublist') == "True";
                var engineId = $(engines[i]).attr('value');
                var engine = {
                    engineTranslatedId: engineId,
                    engineId: 0
                };

                if (hasSubList) {
                    var sublist = searchControl.getSelectedSubItemByTypeAndId('engine', parentId);
                    if (sublist.length != 0) {
                        for (var j = 0; j < sublist.length; j++) {
                            var newEngine = {
                                engineTranslatedId: engineId,
                                engineId: $(sublist[j]).attr('value')
                            }
                            vehicleSearchCriteria.EngineTranslatedEngines.push(newEngine);
                        }
                    } else {
                        vehicleSearchCriteria.EngineTranslatedEngines.push(engine);
                    }
                } else {
                    vehicleSearchCriteria.EngineTranslatedEngines.push(engine);
                }
            }
        }



        //vehicleSearchCriteria.RemainingModelTrims = [];
        //var remainingModels = searchControl.getRemainingSelectedItemsByTypeForModel('model');
        //if (remainingModels.length !== 0) {
        //    for (var i = 0; i < remainingModels.length; i++) {
        //        var remainingParentId = $(remainingModels[i]).attr('parentid');
        //        var remainingHasSubList = $(remainingModels[i]).attr('hassublist') == "True";
        //        var remainingModelId = $(remainingModels[i]).attr('value');
        //        var remainingModel = {
        //            modelId: remainingModelId,
        //            trimId: 0
        //        };
        //        if (remainingHasSubList) {
        //            var remainingSublist = searchControl.getRemainingSelectedSubItemByTypeAndIdForModel('model', remainingParentId);
        //            if (remainingSublist.length != 0) {
        //                for (var j = 0; j < remainingSublist.length; j++) {
        //                    var remainingNewModel = {
        //                        modelId: remainingModelId,
        //                        trimId: $(remainingSublist[j]).attr('value')
        //                    }
        //                    vehicleSearchCriteria.RemainingModelTrims.push(remainingNewModel);
        //                }
        //            } else {
        //                vehicleSearchCriteria.RemainingModelTrims.push(remainingModel);
        //            }
        //        } else {
        //            vehicleSearchCriteria.RemainingModelTrims.push(remainingModel);
        //        }
        //    }
        //}


        vehicleSearchCriteria.BodyStyles = [];
        var styles = searchControl.getSelectedItemsByType('style');
        if (styles.length !== 0) {
            for (var i = 0; i < styles.length; i++) {
                vehicleSearchCriteria.BodyStyles.push($(styles[i]).attr('value'));
            }
        } else {
            if (vehicleSearchCriteria.InLitmitedMode) {
                vehicleSearchCriteria.BodyStyles = [];
                var remainingBodyStyles = searchControl.getRemainingSelectedItemsByType('style');
                if (remainingBodyStyles.length !== 0) {
                    for (var i = 0; i < remainingBodyStyles.length; i++) {
                        vehicleSearchCriteria.BodyStyles.push($(remainingBodyStyles[i]).attr('value'));
                    }
                }
            }
        }



        vehicleSearchCriteria.ExteriorColors = [];
        var colors = searchControl.getSelectedItemsByType('color');
        if (colors.length !== 0) {
            for (var i = 0; i < colors.length; i++) {
                vehicleSearchCriteria.ExteriorColors.push($(colors[i]).attr('value'));
            }
        }

        //vehicleSearchCriteria.RemainingExteriorColors = [];
        //var remainingExteriorColors = searchControl.getRemainingSelectedItemsByType('color');
        //if (remainingExteriorColors.length !== 0) {
        //    for (var i = 0; i < remainingExteriorColors.length; i++) {
        //        vehicleSearchCriteria.RemainingExteriorColors.push($(remainingExteriorColors[i]).attr('value'));
        //    }
        //}

        vehicleSearchCriteria.FuelTypes = [];
        var fuels = searchControl.getSelectedItemsByType('fuel');
        if (fuels.length !== 0) {
            for (var i = 0; i < fuels.length; i++) {
                vehicleSearchCriteria.FuelTypes.push($(fuels[i]).attr('value'));
            }
        }

        //vehicleSearchCriteria.RemainingFuelTypes = [];
        //var remainingFuelTypes = searchControl.getRemainingSelectedItemsByType('fuel');
        //if (remainingFuelTypes.length !== 0) {
        //    for (var i = 0; i < remainingFuelTypes.length; i++) {
        //        vehicleSearchCriteria.RemainingFuelTypes.push($(remainingFuelTypes[i]).attr('value'));
        //    }
        //}



        //vehicleSearchCriteria.RemainingEngines = [];
        //var remainingEngines = searchControl.getRemainingSelectedItemsByType('engine');
        //if (remainingEngines.length !== 0) {
        //    for (var i = 0; i < remainingEngines.length; i++) {
        //        vehicleSearchCriteria.RemainingEngines.push($(remainingEngines[i]).attr('value'));
        //    }
        //}

        vehicleSearchCriteria.Drives = [];
        var drives = searchControl.getSelectedItemsByType('drive');
        if (drives.length !== 0) {
            for (var i = 0; i < drives.length; i++) {
                vehicleSearchCriteria.Drives.push($(drives[i]).attr('value'));
            }
        }

        //vehicleSearchCriteria.RemainingDrives = [];
        //var remainingDrives = searchControl.getRemainingSelectedItemsByType('drive');
        //if (remainingDrives.length !== 0) {
        //    for (var i = 0; i < remainingDrives.length; i++) {
        //        vehicleSearchCriteria.RemainingDrives.push($(remainingDrives[i]).attr('value'));
        //    }
        //}

        vehicleSearchCriteria.Mileages = [];
        var miles = searchControl.getSelectedItemsByType('mile');
        if (miles.length !== 0) {
            for (var i = 0; i < miles.length; i++) {
                vehicleSearchCriteria.Mileages.push($(miles[i]).attr('value'));
            }
        }

        //vehicleSearchCriteria.RemainingMileages = [];
        //var remainingMileages = searchControl.getRemainingSelectedItemsByType('mile');
        //if (remainingMileages.length !== 0) {
        //    for (var i = 0; i < remainingMileages.length; i++) {
        //        vehicleSearchCriteria.RemainingMileages.push($(remainingMileages[i]).attr('value'));
        //    }
        //}

        vehicleSearchCriteria.PageSize = $('[id$="pageSize"]').val();
        vehicleSearchCriteria.PageNumber = $('[id$="currentPage"]').val();

    },
    applyLazyLoadForImages: function () {
        $("img.lazy").lazyload({
            effect: "fadeIn"
        });
    },
    getParentIdByTypeAndId: function (type, id) {
        return $('ul[data-type="' + type + '"]').find('li:not(.list-group-custom-default):not(.sublistItem)[value="' + id + '"]');
    },
    getSelectedItemsByType: function (type) {
        return $('ul[data-type="' + type + '"]').find('li.active:not(.list-group-custom-default):not(.sublistItem)');
    },
    getRemainingSelectedItemsByType: function (type) {
        return $('ul[data-type="' + type + '"]').find('li:not(.list-group-custom-default):not(.sublistItem)');
    },
    getRemainingSelectedItemsByTypeForModel: function (type) {
        return $('ul[data-type="' + type + '"]').find('li:not(.list-group-custom-default):not(.sublistItem)');
    },
    getRemainingSelectedSubItemByTypeAndId: function (type, id) {
        var result = null;
        var subList = $('ul[data-type="' + type + '"]').find('div.list-group-submenu[id="' + id + '"]');
        if (typeof subList != "undefined" && subList != null) {
            result = $(subList).find('.sublistItem:not([style="display: none;"])');
        }
        return result;
    },
    getRemainingSelectedSubItemByTypeAndIdForModel: function (type, id) {
        var result = null;
        var subList = $('ul[data-type="' + type + '"]').find('div.list-group-submenu[id="' + id + '"]');
        if (typeof subList != "undefined" && subList != null) {
            result = $(subList).find('.sublistItem');
        }
        return result;
    },
    getSelectedSubItemByTypeAndId: function (type, id) {
        var result = null;
        var subList = $('ul[data-type="' + type + '"]').find('div.list-group-submenu[id="' + id + '"]');
        if (typeof subList != "undefined" && subList != null) {
            result = $(subList).find('.sublistItem.active');
        }
        return result;
    },
    setValueForSelectedItemsByTypeAndId: function (type, id, count) {
        $('ul[data-type="' + type + '"]').find('li:not(.list-group-custom-default):not(.sublistItem)[value="' + id + '"] span.badge').text(count);
    },
    setValueForSelectedItemsOfSubMenuByTypeAndId: function (type, parentId, id, count) {
        var subList = $('ul[data-type="' + type + '"]').find('div.list-group-submenu[id="' + parentId + '"]');
        $(subList).find('li.sublistItem:not(.list-group-custom-default)[value="' + id + '"] span.badge').text(count);
    },
    displayPagination: function (isShow) {
        if (isShow) {
            $('.vsr-pagenation').show();
        } else {
            $('.vsr-pagenation').hide();
        }

    },
    hookUpPagination: function () {
        currentPagingTop = $('#vsr-pagenationTop').bootpag({
            total: $('[id$="total"]').val(),
            href: siteMaster.currentUrl() + location.pathname + searchControl.modifyUrlByQuerySearchString() + siteMaster.formatedQueryStringQuote() + 'page={{number}}',
            maxVisible: 5,
            leaps: false,
            disabledClass: 'disabled',
            page: $('[id$="currentPage"]').val(),
            next: 'Next',
            prev: 'Prev'
        }).on("page", function (event, /* page number here */ num) {
            vehicleSearchCriteria.IsViewAll = false;
            $('[id$="currentPage"]').val(num);
            searchControl.reloadData();
            $(this).bootpag({ total: $('[id$="total"]').val() });
            $(currentPagingBottom).bootpag({ page: $('[id$="currentPage"]').val(), total: $('[id$="total"]').val() });
        });

        currentPagingBottom = $('#vsr-pagenationBottom').bootpag({
            total: $('[id$="total"]').val(),
            href: siteMaster.currentUrl() + location.pathname + searchControl.modifyUrlByQuerySearchString() + siteMaster.formatedQueryStringQuote() + 'page={{number}}',
            maxVisible: 5,
            leaps: false,
            disabledClass: 'disabled',
            page: $('[id$="currentPage"]').val(),
            next: 'Next',
            prev: 'Prev'
        }).on("page", function (event, /* page number here */ num) {
            vehicleSearchCriteria.IsViewAll = false;
            $('[id$="currentPage"]').val(num);
            searchControl.reloadData();
            $(this).bootpag({ total: $('[id$="total"]').val() });
            $(currentPagingTop).bootpag({ page: $('[id$="currentPage"]').val(), total: $('[id$="total"]').val() });
        });
    },
    setPaginationTotal: function () {
        $(currentPagingTop).bootpag({ page: $('[id$="currentPage"]').val(), total: $('[id$="total"]').val() });
        $(currentPagingBottom).bootpag({ page: $('[id$="currentPage"]').val(), total: $('[id$="total"]').val() });
    },
    tryParseValue: function (value) {
        return parseFloat(value);
    }
};



