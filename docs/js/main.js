jQuery(document).ready(function($){
	// open the panel
	$('.panel-btn').on('click', function(event){
		event.preventDefault();
		$('.panel').addClass('is-visible');
		$("#email").focus();
	});
	// close the panel
	$('.panel').on('click', function(event){
		if( $(event.target).is('.panel') || $(event.target).is('.panel-close') ) { 
			$('.panel').removeClass('is-visible');
			event.preventDefault();
		}
	});
	// open help panel on unauth screen
	$('.panel-help').on('click', function(event){
		event.preventDefault();
		$('.panel-home-help').addClass('is-visible');
	});
	// close the help panel
	$('.panel-home-help').on('click', function(event){
		if( $(event.target).is('.panel-home-help') || $(event.target).is('.panel-close') ) { 
			$('.panel-home-help').removeClass('is-visible');
			event.preventDefault();
		}
	});


    // Help slide gesture
      let panel = document.getElementById('help-panel');
      if (panel) {
//        let touchRegion = new ZingTouch.Region(panel, false, false);
//        touchRegion.bind(panel, 'swipe', (event) => {
//          let direction = event.detail.data[0].currentDirection;
//          if (direction < 45 || direction > 315) {
//            $(panel).removeClass('is-visible');
//            window.setTimeout(() => {uiBunch.css({right: ''});}, 600);
//          }
//        });

        let panelContainer = document.getElementById('help-panel-container');
        let panelHeader = document.getElementById('help-panel-header');
	let originX = 0;
	let dragging = false;
        let uiBunch = $([panelContainer, panelHeader]);
        uiBunch.on('mousedown touchdown', (event) => {
          if (!dragging) {
            dragging = true;
            originX = event.screenX;
          }
	});
        uiBunch.on('mousemove touchmove', (event) => {
          if (dragging) {
            let newX = event.screenX - originX;
            if (newX >= 0)
              uiBunch.css({right: -newX + 'px'});
          }
	});
        uiBunch.on('mouseup touchup', (event) => {
          if (dragging) {
            dragging = false;
            let newX = event.screenX - originX;
            if (newX > (panelContainer.offsetWidth * 0.75)) {
              $(panel).removeClass('is-visible');
              window.setTimeout(() => {uiBunch.css({right: ''});}, 600);
            }
            else {
              uiBunch.css({right: '0px', transition: 'right 0.5s'});
              window.setTimeout(() => {uiBunch.css({transition: ''});}, 500);
            }
          }
	});
      }
      else {
        console.log('no help panel');
      }

});
