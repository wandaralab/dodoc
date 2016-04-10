/* VARIABLES */
var socket = io.connect();

var sessionId;
//get current session
var currentFolder = app.folder;
//get current project
var currentProject = app.project;
var imageData = null;




/* fonction accessible depuis l'extérieur :
    - listMediasOfOneType
    - loadProject

*/




// COMMON WITH PROJECT.JS
function loadProject( projectData) {

	var projectName = projectData.name;
	var slugProjectName = projectData.slugProjectName;
	var slugFolderName = projectData.slugFolderName;

  var createdDate = projectData.created;
  var modifiedDate = projectData.modified;

	var createdDateUser = transformDatetoString( createdDate);
	var modifiedDateUser = transformDatetoString( modifiedDate);

	var statut = projectData.statut;
  var imageSrc;
  if( projectData.projectPreviewName !== undefined && projectData.projectPreviewName !== false)
  	imageSrc = projectData.projectPreviewName;

	var $newProject = $(".js--templates > .project").clone(false);
	var path = '/' + slugFolderName + '/' + slugProjectName;

  if( modifiedDate === null)
    $newProject.find('.modify-date').remove();
	if( imageSrc === undefined)
  	$newProject.find( '.image-wrapper img').remove();

  var imageSrc = path + "/" + imageSrc;

  // customisation du projet
	$newProject
	  .attr( 'data-projectname', slugProjectName)
	  .attr( 'data-statut', statut)
	  .data( 'slugProjectName', slugProjectName)
  	.data( 'mtimestamp', transformDatetoTimestamp( createdDate))
  	.data( 'ctimestamp', transformDatetoTimestamp( modifiedDate))
	  .find( '.statut-type').text( statut).end()
	  .find( '.image-wrapper img').attr('src', imageSrc).attr('alt', projectName).end()
	  .find( '.create-date').text( createdDateUser).end()
	  .find( '.modify-date').text( modifiedDateUser).end()
	  .find( '.title').text( projectName).end()
	  .find( '.project-link').attr( 'href', path).end()
	  .find( '.button-wrapper_capture').attr( 'href', path + '/capture').end()
	  .find( '.button-wrapper_bibli').attr( 'href',  path + '/bibliotheque/medias').end()
	  .find( '.button-wrapper_publi').attr( 'href', path + '/bibliotheque/panneau-de-publications').end()
  ;
	return $newProject;
}


function listMediasOfOneType( mediasData) {
  var $allMedias = $();
  var lastMedias = mediasData;
  $.each( lastMedias, function( index, mediaTypeContent) {
    $.each( mediaTypeContent, function( metaJsonName, mediaDatas) {
      var pathMediaFolder = mediaDatas.pathMediaFolder;
      var mediaName = dodoc.regexpRemoveFileExtension.exec( metaJsonName)[1];
      var newMedia = makeOneMedia( pathMediaFolder, mediaName, mediaDatas);
      $allMedias = $allMedias.add( newMedia);
    });
  });

  return $allMedias;
}

function makeOneMedia( pathMediaFolder, mediaName, mediaDatas) {

  var $currentMedia = '';
  var mediaFilenames = mediaDatas.files;

  if( pathMediaFolder === dodoc.projectPhotosFoldername)
    $currentMedia = showImage( pathMediaFolder, mediaName, mediaFilenames);

  if( pathMediaFolder === dodoc.projectAnimationsFoldername)
    $currentMedia = showAnimation( pathMediaFolder, mediaName, mediaFilenames);

  if( pathMediaFolder === dodoc.projectVideosFoldername)
    $currentMedia = showVideo( pathMediaFolder, mediaName, mediaFilenames);

  if( pathMediaFolder === dodoc.projectAudiosFoldername)
    $currentMedia = showAudio( pathMediaFolder, mediaName, mediaFilenames);

  if( pathMediaFolder === dodoc.projectTextsFoldername)
    $currentMedia = showText( pathMediaFolder, mediaName, mediaFilenames, mediaDatas);

  var pathToMeta = makeFullMediaPath( pathMediaFolder + '/' + mediaName);

  $currentMedia
    .attr( 'data-mediaName', mediaName)
    .attr( 'data-pathToMeta', pathToMeta)
    .attr( 'data-mediatype', pathMediaFolder)
    .attr( 'data-type', pathMediaFolder)
  	.attr( 'data-informations', mediaDatas.informations)
  	.addClass( mediaDatas.fav ? 'is--highlight' : '')
  	.find( '.mediaData--informations')
  	  .html( mediaDatas.informations)
    .end()
  	.data( 'mtimestamp', transformDatetoTimestamp( mediaDatas.modified))
  	.data( 'ctimestamp', transformDatetoTimestamp( mediaDatas.created))
    ;

  if( mediaDatas.title === undefined && mediaDatas.informations === undefined) {
    $currentMedia.find('.mediaData').remove();
  }

  if( mediaDatas.fav === "true") {
    $currentMedia.addClass('is--highlight');
  }

  return $currentMedia;
}

function makeFullMediaPath( pathToMediaFolderAndMedia) {
  return '/' + currentFolder + '/' + currentProject + '/' + pathToMediaFolderAndMedia;
}

function showImage( pathMediaFolder, mediaName, mediaFilenames) {

  var pathToFile = makeFullMediaPath( pathMediaFolder + '/' + mediaFilenames[0]);

	var mediaItem = $(".js--templates .media_image").clone(false);
	mediaItem
    .find( 'img').attr('src', pathToFile)
    ;
	return mediaItem;
}

function showAnimation( pathMediaFolder, mediaName, mediaFilenames) {

  var thumbFilename;
  var videoFilename;
  $.each( mediaFilenames, function( key, mediaFilename) {
    if( mediaFilename.indexOf( "jpg") !== -1 || mediaFilename.indexOf( "png") !== -1) {
      thumbFilename = mediaFilename;
    } else if ( mediaFilename.indexOf( "mp4") !== false ||  mediaFilename.indexOf( "webm") !== false) {
      videoFilename = mediaFilename;
    }
  });

  var pathToThumb = makeFullMediaPath( pathMediaFolder + '/' + thumbFilename);
  var pathToVideoFile = makeFullMediaPath( pathMediaFolder + '/' + videoFilename);

	var mediaItem = $(".js--templates .media_stopmotion").clone(false);
	mediaItem
    .find( 'video').attr( 'poster', pathToThumb).end()
    .find( 'source').attr( 'src', pathToVideoFile).end()
  ;

	return mediaItem;
}

function showVideo( pathMediaFolder, mediaName, mediaFilenames) {

  var thumbFilename;
  var videoFilename;

  $.each( mediaFilenames, function( key, mediaFilename) {
    if( mediaFilename.indexOf( "jpg") !== -1 || mediaFilename.indexOf( "png") !== -1) {
      thumbFilename = mediaFilename;
    } else if ( mediaFilename.indexOf( "mp4") !== false ||  mediaFilename.indexOf( "webm") !== false) {
      videoFilename = mediaFilename;
    }
  });

  var pathToThumb = makeFullMediaPath( pathMediaFolder + '/' + thumbFilename);
  var pathToVideoFile = makeFullMediaPath( pathMediaFolder + '/' + videoFilename);

	var mediaItem = $(".js--templates .media_video").clone(false);
	mediaItem
    .find( 'video').attr( 'poster', pathToThumb).end()
    .find( 'source').attr( 'src', pathToVideoFile).end()
  ;

	return mediaItem;
}

function showAudio( pathMediaFolder, mediaName, mediaFilenames) {
  var pathToFile = makeFullMediaPath( pathMediaFolder + '/' + mediaFilenames[0]);

	var mediaItem = $(".js--templates .media_audio").clone(false);
	mediaItem
    .find( 'source').attr( 'src', pathToFile)
    ;
	return mediaItem;
}

function showText( pathMediaFolder, mediaName, mediaFilenames, mediaDatas) {

  var mediaTitle = mediaDatas.titleOfTextmedia;
  var mediaText = mediaDatas.textOfTextmedia;

	var mediaItem = $(".js--templates .media_text").clone(false);
	mediaItem
	  .find( '.mediaContent--titleOfTextmedia')
	    .html( mediaTitle)
    .end()
	  .find( '.mediaContent--textOfTextmedia')
	    .html( mediaText)
    .end()
    ;
	return mediaItem;

}

function insertOrReplaceProject( $item, $container) {

  var $items = $container.find(".project");
  var itemName = $item.data( "projectname");
  var $existingItem = $items.filter( "[data-projectname='" + itemName + "']");
  if( $existingItem.length == 1) {
    $existingItem.replaceWith( $item);
    return "updated";
  }

  if( $items.length > 0) {
    var mediaMTime = parseInt( $item.data("ctimestamp"));
    debugger;
    if( mediaMTime !== false) {
      var $eles;
      $items.each( function( index) {
        if( mediaMTime > parseInt( $(this).data("ctimestamp"))) {
          $eles = $(this);
          return false;
        }
      });
      if( $eles !== undefined)
        $item.insertBefore( $eles);
      else
        $container.append( $item);
    }
  } else {
    $container.append( $item);
  }
  return "inserted";
}

function insertOrReplaceMedia( $mediaItem, $mediaContainer) {

  var $mediaItems = $mediaContainer.find(".media");
  var mediaName = $mediaItem.data( "medianame");
  var $existingMedia = $mediaItems.filter( "[data-medianame='" + mediaName + "']");

  if( $existingMedia.length >= 1) {
    $existingMedia.replaceWith( $mediaItem);
    return "updated";
  }
  // trouver où l'insérer en fonction de la date de modification
  if( $mediaItems.length > 0) {
    var mediaMTime = parseInt( $mediaItem.data("ctimestamp"));
    if( mediaMTime !== false) {
      var $eles;
      $mediaItems.each( function( index) {
        if( mediaMTime > parseInt( $(this).data("ctimestamp"))) {
          $eles = $(this);
          return false;
        }
      });
      if( $eles !== undefined)
        $mediaItem.insertBefore( $eles);
      else
        $mediaContainer.append( $mediaItem);
    }
  } else {
    $mediaContainer.append( $mediaItem);
  }
  return "inserted";
}


function createNewMedia( mediaData){
  mediaData.slugFolderName = currentFolder;
  mediaData.slugProjectName = currentProject;
	socket.emit( 'newMedia', mediaData);
}
function editMedia( mediaData){
  mediaData.slugFolderName = currentFolder;
  mediaData.slugProjectName = currentProject;
	socket.emit( 'editMediaMeta', mediaData);
}
function listOneMedia( mediaData) {
  mediaData.slugFolderName = currentFolder;
  mediaData.slugProjectName = currentProject;
	socket.emit( 'listOneMedia', mediaData);
}



// en cours : gestion des modals. Elles s'ouvrent avec un trigger sur $(document), qui passe les données à afficher dedans
var modals = {

  init : function() {


		$(document).on("modal::editprojet", function(e) {
  		modals.editProject();
		});
  },

	editProject : function() {



  },


}




function getPathToMedia( projectPath, mediasFolderPath, mediaName) {
  return projectPath + '/' + mediasFolderPath + '/' + mediaName;
}
function getProjectPath( slugFolderName, slugProjectName) {
  return slugFolderName + '/' + slugProjectName;
}
function getMediaFolderPathByType( mediaType) {
  if( mediaType == 'photo')
    return getPhotoPathOfProject();
  if( mediaType == 'video')
    return getVideoPathOfProject();
  if( mediaType == 'animation')
    return getAnimationPathOfProject();
  if( mediaType == 'audio')
    return getAudioPathOfProject();
  if( mediaType == 'text')
    return getTextPathOfProject();
}
function getPhotoPathOfProject() {
  return dodoc.projectPhotosFoldername;
}
function getAnimationPathOfProject() {
  return dodoc.projectAnimationsFoldername;
}
function getVideoPathOfProject() {
  return dodoc.projectVideosFoldername;
}
function getAudioPathOfProject() {
  return dodoc.projectAudiosFoldername;
}
function getTextPathOfProject() {
  return dodoc.projectTextsFoldername;
}

function getPathToMediaFile( projectPath, mediasFolderPath, mediaName) {
  return projectPath + '/' + mediasFolderPath + '/' + mediaName;
}
