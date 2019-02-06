let webdriver = require ('selenium-webdriver');
let chrome = require('selenium-webdriver/chrome');
let url = require('url');//internal node module
let querystring = require('querystring');
let paths = require('./paths.js');

let service = new chrome.ServiceBuilder("./node_modules/chromedriver/lib/chromedriver/chromedriver.exe").build();
chrome.setDefaultService(service);

let By = webdriver.By;

const screen = {
  width: 640,
  height: 480
};

let driver = new webdriver.Builder().forBrowser('chrome').setChromeOptions(new chrome.Options().headless().windowSize(screen))
.build();

/*function main (N, P, K, callback) {
	driver.get('https://soilhealth.dac.gov.in/calculator/calculator');
	pause (5, fillValues.bind(null, N, P, K, async function(response){
		await console.log(response);
		return callback(response);
	}));
	}*/
	

function pause (time, funcName){
	setTimeout(funcName, time*1000);
}

function sleep(ms){
    return new Promise(resolve=>{
        setTimeout(resolve,ms)
    });
}

function quitDriver() {
	driver.close();
	driver.quit();
}

exports.handler = function (event, context, callback){
	let urea = "";
	let ureaDosage = "";
	let response = {};
	let responseBody = {};
	let reco1 = {};
	let reco2 = {};
	let fertilizer = [];
	let dosage = [];
	let fertilizer2 = [];
	let dosage2 = [];
	let N = 0, P = 0, K = 0;

	if (event.queryStringParameters !== null && event.queryStringParameters !== undefined) {
       if (event.queryStringParameters.N !== undefined && 
            event.queryStringParameters.N !== null && 
            event.queryStringParameters.N !== "") {
            N = event.queryStringParameters.N;
        }

        if (event.queryStringParameters.P !== undefined && 
            event.queryStringParameters.P !== null && 
            event.queryStringParameters.P !== "") {
            P = event.queryStringParameters.P;
        }

        if (event.queryStringParameters.K !== undefined && 
            event.queryStringParameters.K !== null && 
            event.queryStringParameters.K !== "") {
            K = event.queryStringParameters.K;
        }
    }
	

	driver.get('https://soilhealth.dac.gov.in/calculator/calculator');
	pause(8, fillStateCode);/*await sleep(5000);*/

	/*let fertilizerPath = ['//*[@id="C1F1"]/option[@value="1$11$46.0000$0.0000$0.0000"]', '//*[@id="C1F2"]/option[@value="2$12$0.0000$16.0000$0.0000"]', '//*[@id="C1F3"]/option[@value="3$19$0.0000$0.0000$60.0000"]'];
	let fertilizerPath2 = ['//*[@id="C2F1"]/option[@value="5$39$16.0000$44.0000$0.0000"]', '//*[@id="C2F2"]/option[@value="1$11$46.0000$0.0000$0.0000"]', '//*[@id="C2F3"]/option[@value="3$19$0.0000$0.0000$60.0000"]'];
	let dosagePath = ['//*[@id="Comb1_Fert1_Rec_dose1"]', '//*[@id="Comb1_Fert2_Rec_dose1"]', '//*[@id="Comb1_Fert3_Rec_dose1"]'];
	let dosagePath2 = ['//*[@id="Comb2_Fert1_Rec_dose1"]', '//*[@id="Comb2_Fert2_Rec_dose1"]', '//*[@id="Comb2_Fert3_Rec_dose1"]'];*/
	
	function fillStateCode(){
		driver.findElement(By.xpath(paths.stateCode)).click();
		console.log(driver.findElement(By.xpath(paths.stateCode)).getText());
		pause(8, fillDistrictNPK);//8
	} 
	
	//await sleep (8000);
	function fillDistrictNPK(){
		driver.findElement(By.xpath(paths.districtCode)).click();
		driver.findElement(By.xpath(paths.N)).sendKeys(N);
		driver.findElement(By.xpath(paths.P)).sendKeys(P);
		driver.findElement(By.xpath(paths.K)).sendKeys(K);
		pause(2, clickContinue);
	}

	/*await sleep (2000);*/
	function clickContinue(){
		driver.findElement(By.xpath(paths.continue)).click();
		pause(2, fillCropGroup);	//2
	}
	
	//await sleep (2000);
	function fillCropGroup(){
		driver.findElement(By.xpath(paths.cropGroup)).click();	
		pause(2, fillCropCode);
	}
	
	//await sleep (2000);
	function fillCropCode(){
		driver.findElement(By.xpath(paths.cropCode)).click();
		pause(2, clickCalculate);//2	
	}
	
	//await sleep (2000);
	function clickCalculate(){
		driver.findElement(By.xpath(paths.calculate)).click();
		pause(2, fetchResults);	
	}
	
	//await sleep (1000);
	function fetchResults(){
		
		for (var i = 0; i < paths.fertilizerPath.length; i++) {
			driver.findElement(By.xpath(paths.fertilizerPath[i])).getText().then(function(text){
				fertilizer.push(text);
			});
			driver.findElement(By.xpath(paths.fertilizerPath[i])).getText().then(function(text){
				fertilizer.push(text);
			});

			driver.findElement(By.xpath(paths.dosagePath[i])).getAttribute('value').then(function(text){
				dosage.push(text);
			});
		}

		for (var i = 0; i < paths.fertilizerPath2.length; i++) {

			driver.findElement(By.xpath(paths.fertilizerPath2[i])).getText().then(function(text){
				fertilizer2.push(text);
			});

			driver.findElement(By.xpath(paths.dosagePath2[i])).getAttribute('value').then(function(text){
				dosage2.push(text);
			});

		
		}
		pause(2, compileResults);	
	}

	//await sleep (1000);
	function compileResults() {

		//reco1 = {[urea] : ureaDosage};
		reco1 = dosage.map(function(obj,index){
  			var tempObj = {};
  			tempObj[fertilizer[index]] = obj;
  			return tempObj;
		});

		reco2 = dosage2.map(function(obj,index){
  			var tempObj = {};
  			tempObj[fertilizer2[index]] = obj;
  			return tempObj;
		});

		responseBody = {"1" : reco1, "2": reco2};
		response = {
			statusCode: 200,
			headers: {},
			body: JSON.stringify(responseBody)
		};
		callback(null, response);
		pause(2, quitDriver);
	}
}
	//console.log(reco1);
	
	
	
	//return Promise.resolve(reco1);
	/*return new Promise(resolve => {
		JSON.stringify(reco1);
		resolve();	
	});*/

