"use strict";window.addEventListener("load",function(){var e=createModelModule(),d=createViewModule(),a=document.getElementById("app-container"),n=new d.ImageCollectionView,o=new e.ImageCollectionModel,t=new d.FileChooser;n.setImageCollectionModel(o),a.appendChild(t.getElement()),a.appendChild(n.getElement()),t.addListener(function(d,n,t){_.each(n,function(d){var n=document.createElement("div"),t="File name: "+d.name+", last modified: "+d.lastModifiedDate;n.innerText=t,a.appendChild(n),o.addImageModel(new e.ImageModel("./images/"+d.name,d.lastModifiedDate,"",0))}),e.storeImageCollectionModel(o)});var l=e.loadImageCollectionModel();_.each(l.getImageModels(),function(e){o.addImageModel(e)})});