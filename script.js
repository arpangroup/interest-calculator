var contentDiv = document.getElementById("content");
let ACCOUNT_BALANCE = 0;
let ACCOUNT_STATEMENTS = [];
const INTEREST_RATE = 10;
const MONTHS = {
    JAN: 1,
    FEB: 2,
    MAR: 3,
    APR: 4,
    MAY: 5,
    JUN: 6,
    JUL: 7,
    AUG: 8,
    SEP: 9,
    OCT: 10,
    NOV: 11,
    DEC: 12,
    NAN: 13
};


fetch('./data.json')
.then((response) => response.json())
.then((json) => {
    //console.log(json);
    let statements = json['Sheet1'].map(st => {
        return Object.assign(st, {date: st.date != null ? excelDateToJSDate(st.date) : ''}, {balance: 0})
    });
    statements = getFullStatementsWithInterest(statements);
    console.log("PROCESSED_STATEMENTS: ", statements);
    
    statements.forEach(st => doPayment(st));
    const tableData = generateTableData(ACCOUNT_STATEMENTS);
    document.getElementById("content").innerHTML = tableData;
    
    
});

function getFullStatementsWithInterest(statements) {
    console.log("processStatements...: ", statements);
    // initialize the opening balance
    statements[0].balance = statements[0].amount;

    const updatedStatemens = [];
    let idCount = 0;
    for(let i=0; i< statements.length; i++) {
        const currStatement = statements[i];
        const nextStatement = statements[i+1];
        const isLastStatement = isLastStatementOfMonth(currStatement, nextStatement);

        console.log("isLastStatement: ", isLastStatement)
        if (isLastStatement) {
            const interestStatement = {
                "id": idCount,
                "date": null,
                "transactionType": "INTEREST",
                "amount": 0,
                "balance": 999999
            };
            updatedStatemens.push(Object.assign(currStatement, {id: ++idCount}));
            updatedStatemens.push(Object.assign(interestStatement, {id: ++idCount}));
        } else {
            updatedStatemens.push(Object.assign(currStatement, {id: ++idCount}));
        }
    }


    /*statements.forEach((currStatement,i) => {
        const isLastStatement = isLastStatementOfMonth(currStatement, statements[i+1]);
        console.log("isLastStatement: ", isLastStatement)
        if (isLastStatement) {
            const interestStatement = {
                "id": ++idCount,
                "date": null,
                "transactionType": "INTEREST",
                "amount": 99999
            };
            updatedStatemens.push(Object.assign(currStatement, {id: ++idCount}));
            updatedStatemens.push(interestStatement);
        } else {
            updatedStatemens.push(Object.assign(currStatement, {id: ++idCount}));
        }
    });*/
    return updatedStatemens;
}

function isLastStatementOfMonth (currStatement, nextStatement) {
    const currStatementMonthStr =  currStatement.date.split("-")[1];
    const currStatementMonth =  MONTHS[currStatementMonthStr];

    const nextStatementMonthStr = nextStatement ? nextStatement.date.split("-")[1] : 'NAN';
    const nextStatementMonth =  MONTHS[nextStatementMonthStr];


    console.log("currSTatementMonthSTr: ", currStatementMonthStr, currStatementMonth, currStatement.amount);
    //console.log("nextStatementMonthStr: ", nextStatementMonthStr, nextStatementMonth, );

    return (nextStatementMonth - currStatementMonth > 0) ? true : false;
}



function onchangeAmount() {
    const principle = document.getElementById("amount").value;
    const yearyInterest =  calculateInterest(principle, 10);
    const monthlyInterest =  yearyInterest / 12;
    const dailyInterest = yearyInterest / 360;
    document.getElementById("yearyInterest").innerHTML = yearyInterest;
    document.getElementById("monthlyInterest").innerHTML = monthlyInterest;
    document.getElementById("dailyInterest").innerHTML = dailyInterest;
}
function calculateInterest (principle, rate = 11.75, t=1) {
    const time = t ? t : 1;
    const simpleInterest = (principle * time *  rate) / 100;
    return simpleInterest;
}


function excelDateToJSDate(serial) {
    var utc_days  = Math.floor(serial - 25569);
    var utc_value = utc_days * 86400;                                        
    var date_info = new Date(utc_value * 1000);
 
    var fractional_day = serial - Math.floor(serial) + 0.0000001;
 
    var total_seconds = Math.floor(86400 * fractional_day);
 
    var seconds = total_seconds % 60;
 
    total_seconds -= seconds;
 
    var hours = Math.floor(total_seconds / (60 * 60));
    var minutes = Math.floor(total_seconds / 60) % 60;
 
    // return new Date(date_info.getFullYear(), date_info.getMonth(), date_info.getDate(), hours, minutes, seconds);
    // return `${date_info.getDate()}-${date_info.getMonth()}-${date_info.getFullYear()}`;
    Date.prototype.monthNames = [
        "January", "February", "March",
        "April", "May", "June",
        "July", "August", "September",
        "October", "November", "December"
    ];

    Date.prototype.getMonthName = function() {
        return this.monthNames[this.getMonth()];
    };
    Date.prototype.getShortMonthName = function () {
        return this.getMonthName().substr(0, 3).toUpperCase();
    };

    return `${date_info.getDate()}-${date_info.getShortMonthName()}-${date_info.getFullYear()}`;
 }


function generateTableData(statements){
    const header = `
        <tr>
            <th>#</th>
            <th>Date</th>
            <th>CR/DR</th>
            <th>Amount</th>
            <th>Balance</th>
        </tr>        
    `; 
    let body = '';
    statements.forEach(statement => {
        let rowCell = '';
        let cellCLass = ''; 
        if(statement.transactionType == 'INTEREST'){
            cellCLass = 'interectCell';
        } else if (statement.transactionType == 'CR') {
            cellCLass = 'creditCell';
        }

        // rowCell = `
        //     <tr class="${cellCLass}">
        //         <td >${statement.id}</td>
        //         <td>${statement.date}</td>
        //         <td>${statement.transactionType}</td>
        //         <td>${statement.amount}</td>
        //         <td>${statement.balance}</td>
        //     </tr>
        // `; 
        

        


        if(statement.transactionType == 'INTEREST') {
            rowCell = `
            <tr class="${cellCLass}">
                <td>${statement.id}</td>
                <td colspan="2" class="interectCell">${statement.transactionType}</td>
                <td>${statement.amount}</td>
                <td>${statement.balance}</td>
            </tr>
        `;
        } else {
            rowCell = `
                <tr class="${cellCLass}">
                    <td>${statement.id}</td>
                    <td>${statement.date}</td>
                    <td>${statement.transactionType}</td>
                    <td>${statement.amount}</td>
                    <td>${statement.balance}</td>
                </tr>
            `;
        }
        // }

        body += rowCell;
    });
    return `
        <table class="table  table-bordered">
            ${header}
            ${body}
        <table>`;
 } 

 function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

 function doPayment(props) {
    const {id, date, transactionType, amount} = props;
    let interestOfTheMonth = 0;
    if(transactionType === 'CR') {
        ACCOUNT_BALANCE += amount;
    } else if (transactionType === 'DR') {
        ACCOUNT_BALANCE -= Math.abs(amount);
    } else if (transactionType === 'INTEREST') {
        const yearyInterest =  calculateInterest(ACCOUNT_BALANCE, 10);
        const dailyInterest = yearyInterest / 360;
        const days = 30;
        interestOfTheMonth = dailyInterest * days;

        ACCOUNT_BALANCE = ACCOUNT_BALANCE + interestOfTheMonth;
    } else {

    }
    let balanceFormatted = ACCOUNT_BALANCE.toFixed(2);
    ACCOUNT_STATEMENTS.push({
        "id": id,
        "date": date,
        "transactionType": transactionType,
        "amount": transactionType === 'INTEREST' ? numberWithCommas(interestOfTheMonth.toFixed(2)) : numberWithCommas(amount.toFixed(2)),
        "balance": numberWithCommas(balanceFormatted)
    });
 }