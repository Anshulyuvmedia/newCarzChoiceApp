<?php

use App\Http\Controllers\API\ApiMainController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Models\RegisterUser;
use App\Http\Controllers\ChatTokenController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::post('/generate-chat-token', [ChatTokenController::class, 'generate']);

Route::controller(ApiMainController::class)->group(function () {
    Route::post('loginuser', 'loginuser')->name('api.loginuser');
    Route::post('register_customer', 'register_customer')->name('api.registercustomer');
    Route::get('userprofile/{id}', 'userprofile')->name('api.userprofile');
    Route::post('updateuserprofile/{id}', 'updateuserprofile')->name('api.updateuserprofile');
    Route::post('registerdealer', 'registerdealer')->name('api.registerdealer');
    Route::get('dealerprofile/{id}', 'dealerprofile')->name('api.dealerprofile');
    Route::get('featuredCars', 'featuredCars')->name('api.featuredCars');
    Route::get('brandlist', 'brandlist')->name('api.brandlist');
    Route::get('getMasterDataLists', 'getMasterDataLists')->name('api.getMasterDataLists');
    Route::get('getCarModal/{brandname}', 'getCarModal')->name('api.getCarModal');
    Route::get('getCarVariant/{modalname}', 'getCarVariant')->name('api.getCarVariant');
    Route::post('/filterByAttribute', 'filterByAttribute')->name('api.filterByAttribute');
    Route::post('/filterOldCarByAttribute', 'filterOldCarByAttribute')->name('api.filterOldCarByAttribute');
    Route::get('find-car/{filtertype}', 'findcar')->name('api.findcar');
    Route::post('showcomparecars/{id}', 'showcomparecars')->name('api.showcomparecars');
    Route::post('showcompareresults/{id}', 'showcompareresults')->name('api.showcompareresults');
    Route::get('compareresult/{id}', 'compareresult')->name('api.compareresult');
    Route::post('/bookvehiclenow', 'bookvehiclenow')->name('api.bookvehiclenow');
    Route::get('/news', 'news')->name('api.news');
    Route::get('latestcarupdate', 'latestcarupdate')->name('api.latestcarupdate');
    Route::post('requestinsurance', 'requestinsurance')->name('api.requestinsurance');
    Route::get('electricpage', 'electricpage')->name('api.electricpage');
    Route::get('filternewcardealers', 'filternewcardealers')->name('api.filternewcardealers');
    Route::get('oldvehiclelist', 'oldvehiclelist')->name('api.oldvehiclelist');
    Route::post('sellvehicle', 'sellvehicle')->name('api.sellvehicle');
    Route::post('/givereview', 'givereview')->name('api.givereview');
    Route::get('/getreviews', 'getreviews')->name('api.getreviews');
    Route::get('/viewtheircars/{id}', 'viewtheircars')->name('api.viewtheircars');
    Route::get('carlistingdetails/{id}', 'carlistingdetails')->name('api.carlistingdetails');
    Route::post('newcarloan', 'newcarloan')->name('newcarloan');
    Route::get('newcardealercarlist/{id}', 'newcardealercarlist')->name('api.newcardealercarlist');
    Route::get('myoldvehiclelist/{id}', 'myoldvehiclelist')->name('api.myoldvehiclelist');
    Route::get('oldcarlistingdetails/{id}', 'oldcarlistingdetails')->name('api.oldcarlistingdetails');
    Route::get('getCityList', 'getCityList')->name('api.getCityList');
    Route::get('getLocationData/{city}', 'getLocationData')->name('api.getLocationData');
    Route::get('getOldCarData/{id}', 'getOldCarData')->name('api.getOldCarData');
    Route::post('updateOldCarData/{id}', 'updateOldCarData')->name('api.updateOldCarData');
    Route::post('deletefile', 'deletefile')->name('api.deletefile');
    Route::post('insertcarloanenquiry', 'insertcarloanenquiry')->name('api.insertcarloanenquiry');
    Route::get('fetchSliderImages', 'fetchSliderImages')->name('api.fetchSliderImages');
    Route::get('/getmyenquires/{id}', 'getmyenquires')->name('api.getmyenquires');
    Route::get('/getnewcarenquires/{id}', 'getnewcarenquires')->name('api.getnewcarenquires');
    Route::get('/getcarcolorimages/{id}', 'getcarcolorimages')->name('api.getcarcolorimages');
    Route::get('/getcarimagesgallery/{id}', 'getcarimagesgallery')->name('api.getcarimagesgallery');
    Route::get('/comparevariants', 'comparevariants')->name('api.comparevariants');
});
