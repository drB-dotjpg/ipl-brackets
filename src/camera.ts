function centerOnElements(){
    const root = document.getElementById("bracket-zone");
    const elementsOfInterest = document.querySelectorAll("#zoom > *");

    var maxWidth = 0;
    var minWidth = Number.MAX_SAFE_INTEGER;
    var maxHeight = 0;
    var minHeight = Number.MAX_SAFE_INTEGER;

    for (var i = 0; i < elementsOfInterest.length; i++){
        const elim = elementsOfInterest[i] as HTMLElement;
        const pos = getPosOfElement(elim);
        if (elim.classList.contains("elim-third")){
            console.log(pos);
        }

        maxWidth = Math.max(...pos[0], maxWidth);
        minWidth = Math.min(...pos[0], minWidth);
        maxHeight = Math.max(...pos[1], maxHeight);
        minHeight = Math.min(...pos[1], minHeight);
    }

    const targetWidth = maxWidth - minWidth;
    const targetHeight = maxHeight - minHeight;
    var scale = 1;
    
    if (targetWidth > root.clientWidth){
        scale = (root.clientWidth / Math.max(targetWidth, 400)) * .97;

        if (targetHeight * scale > root.clientHeight){
            scale = (root.clientHeight / Math.max(targetHeight, 400)) * .97;
        }
    }
    else {
        scale = (root.clientHeight / Math.max(targetHeight, 400)) * .97;
        
        if (targetWidth * scale > root.clientWidth){
            scale = (root.clientWidth / Math.max(targetWidth, 400)) * .97;
        }
    }

    moveCamera(
        (root.clientWidth - maxWidth*scale - minWidth*scale ) / 2,
        (root.clientHeight - maxHeight*scale - minHeight*scale) / 2,
        scale
    );
}

function getPosOfElement(elim: HTMLElement) : number[][] {
    return [
        [elim.offsetLeft, elim.offsetLeft + elim.clientWidth],
        [elim.offsetTop, elim.offsetTop + elim.clientHeight]
    ];
}

function moveCamera(x: number, y: number, scale: number){
    const camera = document.querySelector("#camera") as HTMLElement;
    const zoom = document.querySelector("#zoom") as HTMLElement;

    camera.style.transform = `translate(${x}px, ${y}px)`
    zoom.style.transform = `scale(${scale.toString()})`
}