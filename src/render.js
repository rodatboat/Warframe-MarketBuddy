const electron = require('electron');
const { ipcRenderer, shell } = electron;
const fetchData = require('./fetchData')


const form = document.getElementById('itemSearch');
form.addEventListener('submit', submitForm);

function submitForm(e) {
    //e.preventDefault();

    const item = document.getElementById('itemInput').value;

    ipcRenderer.invoke('item:search', item);
    form.reset();
}

function autocomplete(inp, arr) {
    /*the autocomplete function takes two arguments,
    the text field element and an array of possible autocompleted values:*/
    var currentFocus;
    /*execute a function when someone writes in the text field:*/
    inp.addEventListener("input", function(e) {
        var a, b, i, val = this.value;
        /*close any already open lists of autocompleted values*/
        closeAllLists();
        if (!val) { return false;}
        currentFocus = -1;
        /*create a DIV element that will contain the items (values):*/
        a = document.createElement("DIV");
        a.setAttribute("id", this.id + " autocomplete-list");
        a.setAttribute("class", "autocomplete-items");
        /*append the DIV element as a child of the autocomplete container:*/
        this.parentNode.appendChild(a);
        /*for each item in the array...*/
        let counter = 0;
        for (i = 0; i < arr.length; i++) {
          /*check if the item starts with the same letters as the text field value:*/
          if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
            if(counter == 10){
              break;
            }
            /*create a DIV element for each matching element:*/
            b = document.createElement("DIV");
            /*make the matching letters bold:*/
            b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
            b.innerHTML += arr[i].substr(val.length);
            /*insert a input field that will hold the current array item's value:*/
            b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
            /*execute a function when someone clicks on the item value (DIV element):*/
            b.addEventListener("click", function(e) {
                /*insert the value for the autocomplete text field:*/
                inp.value = this.getElementsByTagName("input")[0].value;
                /*close the list of autocompleted values,
                (or any other open lists of autocompleted values:*/
                closeAllLists();
            });
            a.appendChild(b);
            counter++;
          }
        }
    });
    /*execute a function presses a key on the keyboard:*/
    inp.addEventListener("keydown", function(e) {
        var x = document.getElementById(this.id + " autocomplete-list");
        if (x) x = x.getElementsByTagName("div");
        if (e.keyCode == 40) {
          /*If the arrow DOWN key is pressed,
          increase the currentFocus variable:*/
          currentFocus++;
          /*and and make the current item more visible:*/
          addActive(x);
        } else if (e.keyCode == 38) { //up
          /*If the arrow UP key is pressed,
          decrease the currentFocus variable:*/
          currentFocus--;
          /*and and make the current item more visible:*/
          addActive(x);
        }
    });
    function addActive(x) {
      /*a function to classify an item as "active":*/
      if (!x) return false;
      /*start by removing the "active" class on all items:*/
      removeActive(x);
      if (currentFocus >= x.length) currentFocus = 0;
      if (currentFocus < 0) currentFocus = (x.length - 1);
      /*add class "autocomplete-active":*/
      x[currentFocus].classList.add("autocomplete-active");
    }
    function removeActive(x) {
      /*a function to remove the "active" class from all autocomplete items:*/
      for (var i = 0; i < x.length; i++) {
        x[i].classList.remove("autocomplete-active");
      }
    }
    function closeAllLists(elmnt) {
      /*close all autocomplete lists in the document,
      except the one passed as an argument:*/
      var x = document.getElementsByClassName("autocomplete-items");
      for (var i = 0; i < x.length; i++) {
        if (elmnt != x[i] && elmnt != inp) {
          x[i].parentNode.removeChild(x[i]);
        }
      }
    }
    /*execute a function when someone clicks in the document:*/
    document.addEventListener("click", function (e) {
        closeAllLists(e.target);
    });
  }
  
  // Fetching item names.
  let itemNames;
  fetchData.fetchItemNames().then((res)=>{
    itemNames = res.map(({item_name})=>(item_name))
  }).finally(()=>{
    autocomplete(document.getElementById('itemInput'), itemNames);
  });

  // Logic for tabs.
  let resultsTabs = (() => {
    let tabs = document.querySelectorAll('.tabs li');
    let tabsContent = document.querySelectorAll('.tab-content');

    let deactivateAllTabs = (()=>{
      tabs.forEach((tab)=>{
        tab.classList.remove('is-active');
        tab.classList.remove('is-primary');
      });
    });

    let hideTabsContent = (()=>{
      tabsContent.forEach((tabContent)=>{
        tabContent.classList.remove('is-active');
        tabContent.classList.remove('is-primary');
      });
    });

    let activateTabsContent = ((tab)=>{
      tabsContent[getIndex(tab)].classList.add('is-active');
      tabsContent[getIndex(tab)].classList.add('is-primary');
    })

    let getIndex = function (el) {
      return [...el.parentElement.children].indexOf(el);
    };

    tabs.forEach((tab)=>{
      tab.addEventListener('click', ()=>{
        deactivateAllTabs();
        hideTabsContent();
        tab.classList.add('is-active');
        tab.classList.add('is-primary');
        activateTabsContent(tab);
      });
    });

  })();


function createElementFromHTML(htmlString) {
  var div = document.createElement('div');
  div.innerHTML = htmlString.trim();

  return div.firstChild; 
}

function createItemElement(name, price, quantity, item_name, order_type){
  let itemCode = (`<div class="column is-full item box mb-2 p-2">
  <div class="columns is-mobile">
    <div class="column is-1 sellmarker-column container">
      <p class="is-danger has-text-success">|</p>
    </div>
    <div class="column is-half playername-column container">
      <p class="has-text-dark" item-name="${item_name}" order-type="${order_type}">${name}</p>
    </div>
    <div class="column cost-column container">
      <p class="has-text-primary has-text-centered">${price}</p>
    </div>
    <div class="column quantity-column container">
      <p class="has-text-primary has-text-centered">${quantity}</p>
    </div>
    <div class="column quantity-column container">
      <span class="icon has-text-info has-text-centered" id="clipboard-icon">
        <i class="far fa-clipboard has-text-dark" id="clipboard-icon"></i>
      </span>
    </div>
  </div>
</div>`);

return itemCode;
}

let searchResults = (()=>{
  ipcRenderer.on('item:orders', (e, orders)=>{
    let sell_orders = [];
    let buy_orders = [];
    orders.forEach((order)=>{
      if(order.order_type == 'sell' && order.status == 'ingame'){
        sell_orders.push(order);
      } else if(order.order_type == 'buy' && order.status == 'ingame'){
        buy_orders.push(order);
      }
    });
    sell_orders.sort((a, b)=>{
      return a.platinum - b.platinum;
    });
    buy_orders.sort((a, b)=>{
      return b.platinum - a.platinum;
    });

    //console.log(sell_orders);
    
    let sellResultsContainer = document.getElementById('items-sell-list');
    let buyResultsContainer = document.getElementById('items-buy-list');

    sell_orders.forEach((order)=>{
      sellResultsContainer.appendChild(createElementFromHTML(createItemElement(order.playername, order.platinum, order.quantity, order.item_name, order.order_type)));
    });
    buy_orders.forEach((order)=>{
      buyResultsContainer.appendChild(createElementFromHTML(createItemElement(order.playername, order.platinum, order.quantity, order.item_name, order.order_type)));
    });

    let copyClipboard = (()=>{
      let clipIcon = document.getElementById('clipboard-icon');
      clipIcon.addEventListener('click', ()=>{
        let clipBoardData = clipIcon.parentNode.parentNode.getElementsByTagName('div');
        let ordername = clipBoardData[1].children[0].innerHTML;
        let itemname = clipBoardData[1].children[0].getAttribute("item-name").replace(/_/g, " ").replace(/(^\w{1})|(\s{1}\w{1})/g, match => match.toUpperCase());
        let itemprice = clipBoardData[2].children[0].innerHTML;
        let ordertype = clipBoardData[1].children[0].getAttribute("order-type");
        if(ordertype == 'sell'){
          ordertype = 'buy';
        } else {
          ordertype = 'sell';
        }

        let text = `/w ${ordername} Hi! I want to ${ordertype}: ${itemname} for ${itemprice} platinum. (Warframe-MarketBuddy)`;

        const blob = new Blob([text], { type: "text/plain" });
        let data = [new ClipboardItem({ ["text/plain"]: blob })];
        navigator.clipboard.write(data);
      });
    })();

  });
})();

const githubProf = document.getElementById('github-link');
githubProf.addEventListener('click', openGithub);

function openGithub(){
  ipcRenderer.send('open:link', 'https://github.com/rodatboat');
}

const titlebarClose = document.getElementById('titlebar-close');
titlebarClose.addEventListener('click', terminateApp);
function terminateApp(){
  ipcRenderer.send('app:terminate');
}

const titlebarMini = document.getElementById('titlebar-minimize');
titlebarMini.addEventListener('click', minimizeApp);
function minimizeApp(){
  ipcRenderer.send('app:minimize');
}

