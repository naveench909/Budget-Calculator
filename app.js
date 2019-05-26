// BUDGET CONTROLLER
var budgetController = (function(){
    
    function Expense(id, description, value ){
        this.id= id;
        this.description= description;
        this.value= value;
        this.percentage= -1;
    };

    Expense.prototype.calPercentage = function(totalIncome){

        if (totalIncome > 0){
         this.percentage = Math.round((this.value/totalIncome) * 100);
        }else {
            this.percentage = -1;
        }
    }; 

    Expense.prototype.getPercentage = function(){
        return this.percentage;
    }; 

    function Income(id, description, value ){
        this.id= id;
        this.description= description;
        this.value= value;
    };

    function calculateTotals(type){
        sum = 0;
        data.allItem[type].forEach(function(cur){
        sum += cur.value;
    });

        data.total[type] = sum ;
    };
    var data = {
        allItem : {
            exp : [],
            inc : []
        },
        total : {
            exp : 0,
            inc : 0
        },
        budget : 0, 
        percentage : -1
    };

    return { 
        addItem: function(type,des,val){
            var newItem,ID;

            //  creating new id 
            if(data.allItem[type].length > 0 ){
                ID = data.allItem[type][data.allItem[type].length-1].id + 1;
            }else{
                ID = 0;
            }
            // Create new item based on 'inc' or 'exp'
            if(type === 'exp'){
                newItem = new Expense(ID, des,val);
            }else if(type === 'inc'){
                newItem = new Income(ID, des,val);
            }

            // Push item into array
            data.allItem[type].push(newItem);

            // Return the new item
            return newItem; 

        },

        deleteItem : function(type, id){
            var ids, index;

            ids = data.allItem[type].map(function(current){
                return current.id;
            });

            index = ids.indexOf(id);

            if(index !== -1){
                data.allItem[type].splice(index, 1);
            }


        },
        calculatePercentage : function(){

            data.allItem.exp.forEach(function(cur) {
                cur.calPercentage(data.total.inc);
            });

            
        },

        getPercentage : function(){
            var allPerc = data.allItem.exp.map(function(cur){
                return cur.getPercentage();
            });
            return allPerc;
        }, 

        calculateBudget : function(){
            // calculate total income and expenses
            calculateTotals('inc');
            calculateTotals('exp');

            // calculate the budget = income - expenses
            data.budget = data.total.inc - data.total.exp;

            // calculate the percentage of income that we spent
            data.percentage = Math.round((data.total.exp/data.total.inc)*100);

        },
           
        getBudget : function(){
            return {
                budget : data.budget,
                totalInc : data.total.inc,
                totalExp : data.total.exp,
                percentage : data.percentage 
            }
        },

        testing : function(){
            console.log(data);
        }
    };
    

}) ();


  


// UI CONTROLLER
var uiController = (function() {

    var DOMstrings = {
        inputType : ".add__type",
        inputDescription : ".add__description",
        inputValue : ".add__value",
        inputButton : ".add__btn",
        incomeContainer : ".income__list",
        expensesContainer : ".expenses__list",
        budgetLabel : ".budget__value",
        incomeLabel : ".budget__income--value",
        expensesLabel : ".budget__expenses--value",
        percentageLabel : ".budget__expenses--percentage",
        container : ".container ",
        expensesPercLabel : ".item__percentage",
        dateLabel :  ".budget__title--month"
    }; 

        var formatNumber  = function(num, type){

        var numSplit , int, dec ;

        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];
        if(int.length > 3){
            int = int.substr(0, int.length-3) + ',' + int.substr(int.length - 3,3); //input 2310, opt 
        }

        dec = numSplit[1];

        return (type === 'exp' ? '-' : '+') + ' ' + int + '.'+  dec;
    };
    
    return {
        getinput: function(){
            return {
                 type : document.querySelector(DOMstrings.inputType).value,      // will be either inc or exp
                 description : document.querySelector(DOMstrings.inputDescription).value,
                 value : parseFloat(document.querySelector(DOMstrings.inputValue).value)
            }   
        },

        addListItem : function(obj , type){
            var html , newHtml, element ;

            // create the html string with placeholder text
            if(type === 'inc'){
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';

            }else if(type === 'exp'){
                element = DOMstrings.expensesContainer;
                html =  '<div class="item clearfix" id="exp-%id%"> <div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            //replace the placeholder text with some actual data
            newHtml = html.replace('%id%',obj.id);
            newHtml = newHtml.replace('%description%',obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            // insert the html in the the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend',newHtml);  
        },

        deletelistItem : function(selectorID){
            var el = document.getElementById(selectorID);           
            el.parentNode.removeChild(el); 
        },

        clearFields : function(){
            var fields , fieldsArr;

            fields = document.querySelectorAll(DOMstrings.inputDescription + ',' + DOMstrings.inputValue);

            fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach(function(current, index, array){
                current.value = "";
            });
                fieldsArr[0].focus();
            
        },

        displayBudget : function(obj){
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
            
            if(obj.percentage > 0){
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + "%";
            }else{
                document.querySelector(DOMstrings.percentageLabel).textContent = "---";
            }
        },

        displayPercentage : function(percentage){
            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

            var nodeListForEach = function(list, callback){
                for (var i=0 ; i< list.length ; i++){
                    callback(list[i], i);
                }
            }; 

            nodeListForEach(fields, function(current, index){
                if(percentage[index] > 0){
                    current.textContent = percentage[index] + '%';
                }else{
                    current.textContent = '---';
                }
              
            });
        },

        displayMonth : function(){
            var now, months ,year, month;
            now = new Date();

            months = ['January', 'February', 'March','April', 'May', 'June' , 'July' ,'August', 'September', 'October', 'November', 'December'];
            month = now.getMonth();

            year = now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
        },
        
        
        getDOMstrings : function(){
            return DOMstrings;
        }
    }

})();


// CONTROLLER
var controller = (function(budgetCtrl, uictrl){

    var setupEventListners = function(){

        var DOM = uictrl.getDOMstrings();

        document.querySelector(DOM.inputButton).addEventListener("click" ,ctrlAddItem);

        document.addEventListener('keypress',function (event){
            if (event.keyCode===13 || event.which === 13){
                ctrlAddItem();
            }
         });

        document.querySelector(DOM.container).addEventListener("click" ,ctrlDeleteItem);
     };

    var updatePercentage = function(){

        // 1 calculate percentage
        budgetCtrl.calculatePercentage();

        // 2 read the percentage from the budget controller
        var percentage = budgetCtrl.getPercentage();
        // 3 update the UI with the new percentage
        console.log(percentage);
        uictrl.displayPercentage(percentage);

     };

     var updateBudget = function(){
         // 4 calculate the budget
            budgetCtrl.calculateBudget();
         // 5 return the budget
            var budget = budgetCtrl.getBudget();
         // 6 display the budget on the ui
            uictrl.displayBudget(budget); 
     }
    var ctrlAddItem = function(){

       //1 get the  field input data 
       var input = uictrl.getinput();

       if(input.description !== "" && !isNaN(input.value) && input.value > 0){
            //2 add the item to the budget controller
            var newItem = budgetCtrl.addItem(input.type, input.description, input.value);
            console.log(newItem);
            //3 add the item to the ui
            uictrl.addListItem(newItem,input.type);
    
            //4 clear the input fields
            uictrl.clearFields();

            // 5 calculate And Update budget
            updateBudget();

            // calculate and update percentages
            updatePercentage();
       }
    };

    var ctrlDeleteItem = function(event){

       var itemId, splitId, type, ID ;
        
       itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;

       if(itemId){
            splitId = itemId.split('-');
            type = splitId[0];
            ID = parseInt(splitId[1]);
        } 

        // 1 delete the item from the data structure
        budgetCtrl.deleteItem(type,ID); 

        // 2 delete the item from the ui
        uictrl.deletelistItem(itemId);

        // 3 update and show the new budget
        updateBudget();

        // 4 calculate and update percentage
        updatePercentage();
    };

    return {
        init : function (){
            console.log("Application  has Started");
            uictrl.displayMonth(); 
            uictrl.displayBudget({
                budget : 0,
                totalInc : 0,
                totalExp : 0,
                percentage : 0 
            }); 
            setupEventListners();
        }
    }

})(budgetController, uiController); 

controller.init();






