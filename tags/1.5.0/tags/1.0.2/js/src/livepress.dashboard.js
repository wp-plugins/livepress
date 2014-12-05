/*global Livepress, switchEditors, console, Collaboration */
/*jslint vars:true */
var Dashboard = Dashboard || {};

Dashboard.Controller = Dashboard.Controller || function () {
	var itsOn = false;
	var $paneHolder = jQuery( '#lp-pane-holder' );
	var $paneBookmarks = jQuery( '#lp-pane-holder .pane-bookmark' );
	var $hintText = $paneHolder.find( '.taghint' );
	var $hintedInput = $paneHolder.find( '.lp-input' );
	var $searchTabs = jQuery( '#twitter-search-subtabs li' );

	var init = function () {
		if ( Dashboard.Twitter !== undefined ) {
			Dashboard.Twitter.init();
		}
		if ( Dashboard.Comments !== undefined ) {
			if ( Livepress.Config.disable_comments ) {
				jQuery( "#bar-controls .comment-count" ).hide();
				$paneHolder.find( 'div[data-pane-name="Comments"]' ).hide();
				Dashboard.Comments.disable();
			} else {
				Dashboard.Comments.init();
			}
		}

		/* Hints */
		$hintedInput.bind( 'click', function () {
			$hintText = jQuery( this ).parent( "div" ).find( '.taghint' );
			$hintText.css( "visibility", "hidden" );
		} );

		$hintText.bind( 'click', function () {
			var input = jQuery( this ).siblings( "input.lp-input" );
			input.focus();
			input.click();
		} );

		$hintedInput.bind( 'blur', function () {
			if ( jQuery( this ).val() === '' ) {
				$hintText.css( "visibility", "visible" );
			}
		} );

		// Add the new page tab
		var tab_markup = '<a id="content-livepress" class="hide-if-no-js wp-switch-editor switch-livepress">Real-Time</a>';
		jQuery( tab_markup ).insertAfter( '#content-tmce' );
	};

	// handle ON/OFF button
	var live_switcher = function ( evt ) {
		var target = jQuery( evt.srcElement || evt.target ), publish = jQuery( '#publish' ), switchWarning = jQuery( '#lp-switch-panel .warning' );

		itsOn = itsOn ? false : true;

		Dashboard.Helpers.saveEEState( itsOn.toString() );

		if ( itsOn ) {
			switchWarning.hide();
			publish.data( 'publishText', publish.val() );
			if ( publish.val() === "Update" ) {
				publish.val( 'Save and Refresh' );
			} else {
				publish.val( 'Publish and Refresh' );
			}
			publish.removeClass( "button-primary" ).addClass( "button-secondary" );
			jQuery( window ).trigger( 'start.livepress' );
		} else {
			switchWarning.show();
			publish.val( publish.data( 'publishText' ) ).removeClass( "button-secondary" ).addClass( "button-primary" );
			jQuery( window ).trigger( 'stop.livepress' );

			if ( target.hasClass( 'switch-html' ) ) {
				switchEditors.go( 'content', 'html' );
			} else if ( target.hasClass( 'switch-tmce' ) ) {
				switchEditors.go( 'content', 'tmce' );
			}
		}

		$paneHolder.toggleClass( 'scroll-pane' );
	};

	jQuery( '#wp-content-editor-tools' ).on( 'click', '#content-livepress', live_switcher );
	jQuery( '#poststuff' ).on( 'click', '.secondary-editor-tools .switch-tmce, .secondary-editor-tools .switch-html', live_switcher );

	var hidePane = function () {
		jQuery( '#lp-pane-holder div.active' ).removeClass( 'active' );
		jQuery( '.lp-pane-active' ).slideUp().removeClass( 'lp-pane-active' );
		jQuery( '#lp-pane-holder span.count-update' ).show();
		jQuery.each( ['Twitter', 'Comments'], function ( i, name ) {
			if ( ! Dashboard[name].liveCounter.enabled ) {
				Dashboard[name].liveCounter.enable();
			}
		} );
	};

	var switchPane = function ( currPane ) {
		hidePane();
		var currPaneName = currPane.attr( 'data-pane-name' );
		jQuery.each( ['Twitter', 'Comments'], function ( i, name ) {
			if ( name === currPaneName ) {
				Dashboard[name].liveCounter.disable();
			}
		} );

		currPane.addClass( 'active' );
		currPane.siblings( '.lp-pane' ).slideDown().addClass( 'lp-pane-active' );
		currPane.find( 'span.count-update' ).hide();
	};

	var switchTab = function ( currTab ) {
		var currTabName = currTab.attr( 'data-tab-name' );
		console.log( currTabName );
		console.log( currTab );
		currTab.addClass( 'tabs' );
		jQuery( '.lp-search-pane' ).hide();
		var pane = jQuery( '#lp-on-top' ).find( 'div.' + currTabName ).show();
	};

	$searchTabs.bind( 'click', function () {
		if ( ! jQuery( this ).is( '.tabs' ) ) {
			$searchTabs.removeClass( 'tabs' );
			switchTab( jQuery( this ) );
		}
	} );

	$paneBookmarks.bind( 'click', function () {
		var $this = jQuery( this );
		if ( $this.is( '.active' ) === false ) {
			switchPane( $this );
		} else {
			hidePane();
		}
	} );

	init();

	if ( Dashboard.Helpers.getEEState() ) {
		live_switcher( {srcElement: null} );
	}
};

function DHelpers() {
	var SELF = this,
		pane_errors = document.getElementById( 'lp-pane-errors' ),
		$pane_errors = jQuery( pane_errors );

	function LiveCounter( container ) {
		var SELF = this;

		SELF.enable = function() {
			SELF.counterContainer = jQuery( container ).siblings( '.count-update' );
			SELF.count = 0;
			SELF.enabled = true;
			SELF.counterContainer.show();
		};

		SELF.disable = function() {
			SELF.enabled = false;
			SELF.count = 0;
			SELF.counterContainer.text( '0' ).hide();
		};

		SELF.increment = function( num ) {
			SELF.count += num || 1;
			SELF.counterContainer.text( SELF.count );
		};
	}

	SELF.saveEEState = function ( state ) {
		var postId = Livepress.Config.post_id;
		Livepress.storage.set( 'post-' + postId + '-eeenabled', state );
	};

	SELF.getEEState = function () {
		if ( jQuery.getUrlVar( 'action' ) === 'edit' ) {
			var postId = Livepress.Config.post_id;
			if ( ! postId ) {
				return false;
			}

			if ( Livepress.storage.get( 'post-' + postId + '-eeenabled' ) === 'true' ) {
				return true;
			}
		}

		return false;
	};

	SELF.hideAndMark = function ( el ) {
		el.hide().addClass( 'spinner-hidden' );
		return(el);
	};

	SELF.disableAndDisplaySpinner = function ( elToBlock ) {
		var $spinner = jQuery( "<div class='lp-spinner'></div>" );
		if ( elToBlock.is( "input" ) ) {
			elToBlock.attr( "disabled", true );
			var $addButton = this.hideAndMark( elToBlock.siblings( ".button" ) );
			$spinner.css( 'float', $addButton.css( "float" ) );
		}
		elToBlock.after( $spinner );
	};

	SELF.enableAndHideSpinner = function ( elToShow ) {
		elToShow.attr( "disabled", false );
		elToShow.siblings( ".button" ).show();
		elToShow.siblings( '.lp-spinner' ).remove();
	};

	SELF.setSwitcherState = function ( state ) {
		jQuery( document.getElementById( 'live-switcher' ) )
			.removeClass( state === 'connected' ? 'disconnected' : 'connected' )
			.addClass( state );
	};

	SELF.handleErrors = function ( errors ) {
		console.log( errors );
		$pane_errors.html('');
		$pane_errors.hide();
		jQuery.each( errors, function ( field, error ) {
			var error_p = document.createElement( 'p' );
			error_p.className = 'lp-pane-error ' + field;
			error_p.innerHtml = error;
			$pane_errors.append( error_p );
		} );
		$pane_errors.show();
	};

	SELF.clearErrors = function ( selector ) {
		if ( null !== pane_errors ) {
			jQuery( pane_errors.querySelectorAll( selector ) ).remove();
		}
	};

	SELF.hideErrors = function () {
		$pane_errors.hide();
	};

	SELF.createLiveCounter = function ( container ) {
		return new LiveCounter( container );
	};
}

Dashboard.Helpers = Dashboard.Helpers || new DHelpers();
