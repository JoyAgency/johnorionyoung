function loadArt(artId, artName, artPrice, artNextPrice, ownerAddress, locallyOwned) {
  var cardRow = $('#card-row');
  var cardTemplate = $('#card-template');

  if (locallyOwned) {
    cardTemplate.find('.btn-buy').attr('disabled', true);
  } else {
    cardTemplate.find('.btn-buy').removeAttr('disabled');
  }

  cardTemplate.find('.art-name').text(artName);
  cardTemplate.find('.art-name').attr("href", artId + '.html');
  cardTemplate.find('.art-img').attr('src', '/img/' + artId + '.png');
  cardTemplate.find('.art-img').attr("href", artId + '.html');
  cardTemplate.find('.art-owner').text(ownerAddress);
  cardTemplate.find('.art-owner').attr("href", "https://opensea.io/accounts/" + ownerAddress);
  cardTemplate.find('.btn-buy').attr('data-id', artId);
  cardTemplate.find('.art-price').text(parseFloat(artPrice).toFixed(3));
  cardTemplate.find('.art-next-price').text(parseFloat(artNextPrice).toFixed(3));

  cardRow.append(cardTemplate.html());
}

var App = {
  contracts: {},
  JoyArtAddress: '0x96313f2C374F901E3831ea6DE67b1165c4f39A54',

  init() {
    return App.initWeb3();
    if(!web3.isConnected()) {

      // show some dialog to ask the user to start a node
  
   } else {
      
      // start web3 filters, calls, etc
  
   }
  },

  initWeb3() {
    if (typeof web3 !== 'undefined' && typeof web3.currentProvider !== 'undefined') {
      web3Provider = web3.currentProvider;
      web3 = new Web3(web3Provider);
    } else {    
      console.error('No web3 provider found. Please install Metamask on your browser.');
     // swal("You can't see the art 🙈", "💎 Web3 access needed to see and collect art.\n\n🦊 Metamask for desktop or Trust for mobile recomended.\n\n😃 Check the FAQ.");
      var hiddenBox = $( "#web3note" );
      hiddenBox.show();
    }
    return App.initContract();
  },

  initContract() {
    $.getJSON('JoyArt.json', (data) => {
      // Get the necessary contract artifact file and instantiate it with truffle-contract
      const JoyArtArtifact = data;
      App.contracts.JoyArt = TruffleContract(JoyArtArtifact);

      // Set the provider for our contract
      App.contracts.JoyArt.setProvider(web3.currentProvider);

      // User our contract to retrieve the adrians that can be bought
      return App.loadartworks();
  });
  return App.bindEvents();
  },

  loadartworks() {
    web3.eth.getAccounts(function(err, accounts) {
      if (err != null) {
        console.error("An error occurred: " + err);
      } else if (accounts.length == 0) {
        console.log("User is not logged in to MetaMask");
      } else {
        // Remove existing cards
        $('#card-row').children().remove();
      }
    });

    // Get local address so we don't display our owned items
    var address = web3.eth.defaultAccount;
    let contractInstance = App.contracts.JoyArt.at(App.JoyArtAddress);
    return totalSupply = contractInstance.totalSupply().then((supply) => {
      for (var i = 0; i < supply; i++) {
        App.getArtDetails(i, address);
      }
    }).catch((err) => {
      console.log(err.message);
    });
  },

  getArtDetails(artId, localAddress) {
    let contractInstance = App.contracts.JoyArt.at(App.JoyArtAddress);
    return contractInstance.getToken(artId).then((art) => {
      var artJson = {
        'artId'            : artId,
        'artName'          : art[0],
        'artPrice'         : web3.fromWei(art[1]).toNumber(),
        'artNextPrice'     : web3.fromWei(art[2]).toNumber(),
        'ownerAddress'     : art[3]
      };
     
       //Get owner username
    // $.get("https://api.opensea.io/api/v1/accounts/?address=" + art[3], function(data) {
    // var user = data.accounts[0].user
         // var ownerLabel = user ? user.username : art[3]
      
         //Check to see if we own the given Art
      if (artJson.ownerAddress !== localAddress) {
        loadArt(
          artJson.artId,
          artJson.artName,
          artJson.artPrice,
          artJson.artNextPrice,
          artJson.ownerAddress,
          // ownerLabel,
          false
        );
      } else {
        loadArt(
          artJson.artId,
          artJson.artName,
          artJson.artPrice,
          artJson.artNextPrice,
          artJson.ownerAddress,
          // ownerLabel,
          true
        );
      }
   })
     //}).catch((err) => {
     // console.log(err.message);
    //})
  },

  handlePurchase(event) {
    event.preventDefault();

    // Get the form fields
    var artId = parseInt($(event.target.elements).closest('.btn-buy').data('id'));

    web3.eth.getAccounts((error, accounts) => {
      if (error) {
        console.log(error);
      }
      var account = accounts[0];

      let contractInstance = App.contracts.JoyArt.at(App.JoyArtAddress);
      contractInstance.priceOf(artId).then((price) => {
        return contractInstance.purchase(artId, {
          from: account,
          value: price,
        }).then(result => App.loadartworks()).catch((err) => {
          console.log(err.message);
        });
      });
    });
  },

  /** Event Bindings for Form submits */
  bindEvents() {
    $(document).on('submit', 'form.art-purchase', App.handlePurchase);
  },
};

jQuery(document).ready(
  function ($) {
    App.init();
  }
);


//Video Button

var videoPlayButton,
	videoWrapper = document.getElementsByClassName('video-wrapper')[0],
    video = document.getElementsByTagName('video')[0],
    videoMethods = {
        renderVideoPlayButton: function() {
            if (videoWrapper.contains(video)) {
				this.formatVideoPlayButton()
                video.classList.add('has-media-controls-hidden')
                videoPlayButton = document.getElementsByClassName('video-overlay-play-button')[0]
                videoPlayButton.addEventListener('click', this.hideVideoPlayButton)
            }
        },

        formatVideoPlayButton: function() {
            videoWrapper.insertAdjacentHTML('beforeend', '\
                <svg class="video-overlay-play-button" viewBox="0 0 200 200" alt="Play video">\
                    <circle cx="100" cy="100" r="90" fill="none" stroke-width="16" stroke="#FFE70D"/>\
                    <polygon points="70, 55 70, 145 145, 100" fill="#FFE70D"/>\
                </svg>\
            ')
        },

        hideVideoPlayButton: function() {
            video.play()
            videoPlayButton.classList.add('is-hidden')
            video.classList.remove('has-media-controls-hidden')
            video.setAttribute('controls', 'controls')
        }
	}

videoMethods.renderVideoPlayButton()