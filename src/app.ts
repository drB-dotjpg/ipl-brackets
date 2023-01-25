async function pageLoad(){
    const urlParams = new URLSearchParams(window.location.search);
    const bracketId = urlParams.get("bracketId");
    const round = urlParams.get("round");

    const battlefyRes = await getMatchesFromBracketID(bracketId);
    const bracketStyle = battlefyRes.bracketType;
    const matches = battlefyRes.matches;
    console.log(bracketStyle, matches);
    
    const zoom = document.getElementById("zoom");
    switch(bracketStyle){
        case "singleelim":
            zoom.appendChild(getEliminationElement(matches));
            break;
        case "doubleelim":
            zoom.appendChild(getDoubleEliminationElement(matches));
            break;
        case "swiss":
            zoom.appendChild(getSwissElement(matches, parseInt(round)));
            break;
        case "roundrobin":
            zoom.appendChild(getRoundRobinElement(matches, parseInt(round)));
    }
    centerOnElements();
}