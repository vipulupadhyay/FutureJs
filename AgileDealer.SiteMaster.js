$(document).ready(function () {
    siteMaster.initialize();
});


var siteMaster = {
    currentUrl: function () {
        return $('#absoluteUri').val();
    },
    loadingWheel: function () {
        var mask = {
            css: {
                backgroundColor: 'transparent',
                border: 'none',
                zIndex: 10002
            },
            message: '<img width="50" height="50" src="' + siteMaster.currentUrl() + '/Content/Images/new-spinner.gif" />'
        };
        return mask;
    },
    reloadPageWithin30Min: function () {
        var isReloaded = false;
        var myVar = setTimeout(function() {
            if (!isReloaded) {
                window.location.reload();
                isReloaded = true;
            }
        }, 30 * 60 * 1000);
    },
    isMobile: function () {
        try { document.createEvent("TouchEvent"); return true; }
        catch (e) { return false; }
    },
    initialize: function () {
        siteMaster.registerEvents();
        siteMaster.saveGaClientId();
        setTimeout(function () {
            var alternatePhone = $('#altPhone').data('altphonenum');
            var hrefText = 'tel:' + alternatePhone;
            $('#phoneSpan').text(alternatePhone);
            $('#phoneRef').attr('href', hrefText);
        }, 500);
        siteMaster.reloadPageWithin30Min();

    },
    isLocalStorageNameSupported: function () {
        var testKey = 'test', storage = window.localStorage;
        try {
            storage.setItem(testKey, '1');
            storage.removeItem(testKey);
            return true;
        } catch (error) {
            return false;
        }
    },
    formatedQueryStringQuote: function () {
        var result = '?';
        var currentQueryString = location.href;
        if (typeof currentQueryString != "undefined" && currentQueryString != null && currentQueryString != '') {
            if (currentQueryString.indexOf('?') != -1) {
                result = '&';
            }
        }
        return result;
    },
    registerEvents: function () {
        $(document).on('click', '[id^="navBar"]', function() {
            var that = $(this);
            if (siteMaster.isLocalStorageNameSupported()) {
                localStorage.setItem('SearchData', '');
                localStorage.setItem('SearchDataText', '');
            }
        });

        $(document).on('click', '.coupon-stitch', null, function () {
            $(this).print({
                globalStyles: true,
                mediaPrint: false,
                noPrintSelector: ".no-print",
                iframe: true,
                append: null,
                prepend: null,
                manuallyCopyFormValues: true,
                deferred: $.Deferred(),
                timeout: 2000,
                title: null,
                doctype: '<!doctype html>'
            });
        });

        $(document).on('click', '#btnInfo,#btnEdit', function () {
            var textSearch = $('#txtSearch').val();
            localStorage.setItem('SearchData', '');
            localStorage.setItem('SearchDataText', '');
            var data = searchControl.getVehicleSearchCriteria();
            localStorage.setItem('SearchData', JSON.stringify(data.VehicleSearchCriteria));
            if (typeof textSearch != 'undefined' && textSearch != '')
                localStorage.setItem('SearchDataText', textSearch);
        });

        //$(':file').on('fileselect', function (event, numFiles, label) {
        //    var input = $(this).parents('.input-group').find(':text'),
        //        log = numFiles > 1 ? numFiles + ' files selected' : label;
        //    if (input.length) {
        //        input.val(log);
        //    } else {
        //        if (log) alert(log);
        //    }
        //});
    },
    
    sendFile: function (file, callback) {
        var formData = new FormData();
        formData.append('file', file);
        $.ajax({
            type: 'post',
            url: siteMaster.currentUrl() + '/Controllers/SiteMasterController.ashx?method=' + 'UploadImage',
            data: formData,
            success: function (result) {
                if (result.isSuccess == true) {
                    var myPath = "~/MediaUploader/" + result.imageUrl;
                    callback(myPath);
                }
            },
            processData: false,
            contentType: false,
            error: function () {
                alert("Whoops something went wrong!");
            }
        });
    },
    saveGaClientId: function () {
        siteMaster.getGaClientId(siteMaster.postGaClientIdToServer);
    },
    postGaClientIdToServer: function (clientId) {
        var method = 'UpdateGaClientId';
        var data = { clientId: clientId };
        var result = true;
        $.ajax({
            url: siteMaster.currentUrl() + '/Controllers/SiteMasterController.ashx?method=' + method,
            type: 'POST',
            async: true,
            dataType: "json",
            contentType: "application/json",
            cache: false,
            timeout: 300000,
            data: JSON.stringify(data),
            success: function (dataResult) {
                if (dataResult.isSuccess === true) {
                    result = true;
                }
            }
        });
    },
    checkValidationOfCurrentForm: function (currentForm) {
        if (typeof currentForm != "undefined" && currentForm != null) {
            return $('#' + currentForm).find("[data-val=true]:visible:not([type=hidden])").All("valid");
        } else {
            return false;
        }
    },
    touchUpRequireFields: function (currentForm) {
        if (typeof currentForm != "undefined" && currentForm != null) {
            $('#' + currentForm).find("[data-val=true]:visible:not([type=hidden])").blur();
        }
    },
    removeValidationError: function (currentForm) {
        if (typeof currentForm != "undefined" && currentForm != null) {
            $('#' + currentForm).find("input[data-val=true]").removeClass('input-validation-error');
        }
    },
    clearAllInput: function (currentForm) {
        if (typeof currentForm != "undefined" && currentForm != null) {
            $('#' + currentForm).find("input[type=text]").val('');
        }
    },
    getGaClientId: function (callback) {
        var result;
        if (typeof ga != "undefined") {
            ga(function (tracker) {
                result = tracker.get('clientId');
                callback(result);
            });
        }
        return result;
    }
};