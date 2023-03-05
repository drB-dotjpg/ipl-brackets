var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const transitionTl = gsap.timeline();
function pageLoad() {
    var _a, _b, _c;
    return __awaiter(this, void 0, void 0, function* () {
        const urlParams = new URLSearchParams(window.location.search);
        const bracketId = urlParams.get("bracketId");
        const round = (_a = parseInt(urlParams.get("round"))) !== null && _a !== void 0 ? _a : 1;
        const minRound = (_b = urlParams.get("minRound")) !== null && _b !== void 0 ? _b : "1";
        const focus = (_c = urlParams.get("focus")) !== null && _c !== void 0 ? _c : "none";
        const title = urlParams.get("title");
        const refresh = parseInt(urlParams.get("refresh"));
        const notStudio = urlParams.has("notStudioMode");
        const battlefyRes = yield getMatchesFromBracketID(bracketId);
        const bracketStyle = battlefyRes.bracketType;
        const matches = battlefyRes.matches;
        const zoom = document.getElementById("zoom");
        switch (bracketStyle) {
            case "singleelim":
                zoom.appendChild(getEliminationElement(matches, parseInt(minRound)));
                break;
            case "doubleelim":
                zoom.appendChild(getDoubleEliminationElement(matches, parseInt(minRound), focus));
                break;
            case "swiss":
                zoom.appendChild(getSwissElement(matches, round));
                break;
            case "roundrobin":
                zoom.appendChild(getRoundRobinElement(matches, round));
        }
        document.getElementById("title").innerText = title;
        if (!Number.isNaN(refresh) && refresh != 0) {
            setInterval(function () {
                console.log("Refreshing...");
                autoRefresh();
            }, refresh * 1000);
        }
        centerOnElements();
        var inOBS = navigator.userAgent.includes("OBS");
        window.addEventListener('obsSourceActiveChanged', function (event) {
            return __awaiter(this, void 0, void 0, function* () {
                if (inOBS && !notStudio) {
                    console.log("OBS Source Active Changed:", event.detail.active);
                }
                else if (inOBS && notStudio) {
                    console.log("OBS is open but the notStudioMode flag is enabled. Setting soruce active to: ", event.detail.active);
                }
                else {
                    console.log("Graphic is not open in OBS! Soruce active set manually to:", event.detail.active);
                }
                const animElements = document.querySelectorAll(bracketStyle != "swiss" ? ".group-bracket-wrapper, .elim-grid-wrapper" : ".group-round-wrapper");
                transitionTl.clear();
                const connectorTl = gsap.timeline();
                if (event.detail.active) {
                    transitionTl.set({}, {}, "+=.45");
                    connectorTl.set({}, {}, "+=.95");
                    const speed = Math.min(1.1 / animElements.length, .2);
                    for (var i = 0; i < animElements.length; i++) {
                        if (!animElements[i].classList.contains("hor-connector") && !animElements[i].classList.contains("vert-connector")) {
                            transitionTl.fromTo(animElements[i], { scale: .9, opacity: 0 }, { scale: 1, duration: .85, opacity: 1, ease: "power3.out" }, `<+=${speed}`);
                        }
                        else {
                            if (animElements[i].classList.contains("hor-connector")) {
                                connectorTl.fromTo(animElements[i].children, { scale: 1, width: "0" }, { width: "15px", duration: .25, ease: "power1.in" }, `<-=.025`);
                            }
                            else if (animElements[i].classList.contains("vert-connector")) {
                                connectorTl.fromTo(animElements[i].children, { scale: 1, height: "0%" }, { height: "100%", duration: .55, ease: "power4.out" }, ">");
                            }
                        }
                    }
                }
                else {
                    for (var i = 0; i < animElements.length; i++) {
                        if (!animElements[i].classList.contains("hor-connector") && !animElements[i].classList.contains("vert-connector")) {
                            animElements[i].style.opacity = "0";
                            animElements[i].style.transform = "scale(.9)";
                        }
                        else {
                            if (animElements[i].classList.contains("hor-connector")) {
                                gsap.to(animElements[i].children, { width: "0", duration: 0 });
                            }
                            else if (animElements[i].classList.contains("vert-connector")) {
                                gsap.to(animElements[i].children, { height: "0%", duration: 0 });
                            }
                        }
                    }
                }
            });
        });
        var obsEvent = new CustomEvent("obsSourceActiveChanged", { 'detail': {
                "active": !inOBS || notStudio
            } });
        window.dispatchEvent(obsEvent);
        console.log("Graphic Data: ", {
            bracketId,
            bracketStyle,
            matches,
            round,
            minRound,
            focus,
            title,
            refresh,
            inOBS,
            notStudio
        });
    });
}
function autoRefresh() {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        const urlParams = new URLSearchParams(window.location.search);
        const bracketId = urlParams.get("bracketId");
        const battlefyRes = yield getMatchesFromBracketID(bracketId);
        const matches = battlefyRes.matches;
        const elements = document.querySelectorAll(".group-round-wrapper, .elim-round-wrapper");
        for (var i = 0; i < elements.length; i++) {
            const matchId = elements[i].dataset.matchId;
            const match = matches.find(x => x.id == matchId);
            if (match) {
                const element = elements[i];
                const topElement = element.querySelector(".top");
                const bottomElement = element.querySelector(".bottom");
                const topName = topElement.querySelector(".team");
                const bottomName = bottomElement.querySelector(".team");
                const topSeed = (_a = topElement.querySelector(".seed")) !== null && _a !== void 0 ? _a : undefined;
                const bottomSeed = (_b = bottomElement.querySelector(".seed")) !== null && _b !== void 0 ? _b : undefined;
                const topScore = topElement.querySelector(".score");
                const bottomScore = bottomElement.querySelector(".score");
                if (!((getLimitedName(match.topName) == topName.innerText || match.topName == undefined && topName.innerText == "-")
                    && (getLimitedName(match.bottomName) == bottomName.innerText || match.bottomName == undefined && bottomName.innerText == "-")
                    && (match.topScore == topScore.innerText || match.topScore == undefined && topScore.innerText == "-")
                    && (match.bottomScore == bottomScore.innerText || match.bottomScore == undefined && bottomScore.innerText == "-"))) {
                    if (getLimitedName(match.topName) == topName.innerText && getLimitedName(match.bottomName) == bottomName.innerText) {
                        topScore.innerText = match.topScore === undefined ? "-" : match.topScore.toString();
                        bottomScore.innerText = match.bottomScore === undefined ? "-" : match.bottomScore.toString();
                        if (match.topWinner) {
                            topElement.classList.add("winner");
                        }
                        else {
                            topElement.classList.remove("winner");
                        }
                        if (match.bottomWinner) {
                            bottomElement.classList.add("winner");
                        }
                        else {
                            bottomElement.classList.remove("winner");
                        }
                        if (match.topWinner || match.bottomWinner) {
                            element.dataset.roundStatus = "finished";
                        }
                        else if (match.topName !== undefined && match.bottomName === undefined || match.topName === undefined && match.bottomName !== undefined) {
                            element.dataset.roundStatus = "awaiting";
                        }
                        else if (match.topName !== undefined || match.bottomName !== undefined) {
                            element.dataset.roundStatus = "in-progress";
                        }
                        else {
                            element.dataset.roundStatus = "not-started";
                        }
                        centerOnElements(true);
                    }
                    else {
                        const tl = gsap.timeline();
                        tl.to(element, { opacity: 0, duration: 1, ease: "power2.in", onComplete: () => {
                                const domRect = element.getBoundingClientRect();
                                const scale = parseFloat(document.querySelector("#zoom").style.transform.replace("scale(", "").replace(")", ""));
                                element.style.width = `${domRect.width / scale}px`;
                                topName.innerText = match.topName === undefined ? "-" : getLimitedName(match.topName);
                                bottomName.innerText = match.bottomName === undefined ? "-" : getLimitedName(match.bottomName);
                                topScore.innerText = match.topScore === undefined ? "-" : match.topScore.toString();
                                bottomScore.innerText = match.bottomScore === undefined ? "-" : match.bottomScore.toString();
                                if (topSeed !== undefined && bottomSeed !== undefined) {
                                    topSeed.innerText = match.topSeed === undefined ? "-" : match.topSeed.toString();
                                    bottomSeed.innerText = match.bottomSeed === undefined ? "-" : match.bottomSeed.toString();
                                }
                                if (match.topWinner || match.bottomWinner) {
                                    element.dataset.roundStatus = "finished";
                                }
                                else if (match.topName !== undefined && match.bottomName === undefined || match.topName === undefined && match.bottomName !== undefined) {
                                    element.dataset.roundStatus = "awaiting";
                                }
                                else if (match.topName !== undefined || match.bottomName !== undefined) {
                                    element.dataset.roundStatus = "in-progress";
                                }
                                else {
                                    element.dataset.roundStatus = "not-started";
                                }
                                if (match.topWinner) {
                                    topElement.classList.add("winner");
                                }
                                else {
                                    topElement.classList.remove("winner");
                                }
                                if (match.bottomWinner) {
                                    bottomElement.classList.add("winner");
                                }
                                else {
                                    bottomElement.classList.remove("winner");
                                }
                            } });
                        tl.to(element, { duration: 1, width: "auto", ease: "power2.inOut" });
                        tl.to(element, { opacity: 1, duration: 1, ease: "power2.out", onStart: () => {
                                centerOnElements(true);
                            } });
                    }
                }
                else {
                    centerOnElements();
                }
            }
        }
    });
}
function updateGraphicURLs(event) {
    return __awaiter(this, void 0, void 0, function* () {
        const outElim = document.getElementById("out");
        const bracketUrl = document.getElementById("bracketUrl").value;
        const bracketTitle = document.getElementById("bracketTitle").value;
        const refreshFreq = document.getElementById("refreshFreq").value;
        const bracketId = getID(bracketUrl);
        const matchesReq = yield getMatchesFromBracketID(bracketId);
        const bracketType = matchesReq.bracketType;
        const numRounds = matchesReq.numRounds;
        const urls = [];
        switch (bracketType) {
            case "doubleelim":
                urls.push(`Entire Bracket:\n${window.location.href}graphics/${event}.html?bracketId=${bracketId}&title=${encodeURIComponent(bracketTitle)}&refresh=${refreshFreq}`);
                urls.push(`Winners only:\n${window.location.href}graphics/${event}.html?bracketId=${bracketId}&title=${encodeURIComponent(`${bracketTitle} - Winners`)}&refresh=${refreshFreq}&focus=winners`);
                urls.push(`Losers only:\n${window.location.href}graphics/${event}.html?bracketId=${bracketId}&title=${encodeURIComponent(`${bracketTitle} - Losers`)}&refresh=${refreshFreq}&focus=losers`);
                if (numRounds > 4) {
                    urls.push(`Top 24:\n${window.location.href}graphics/${event}.html?bracketId=${bracketId}&title=${encodeURIComponent(`${bracketTitle} - Top 24`)}&minRound=${numRounds - 2}&refresh=${refreshFreq}`);
                }
                break;
            case "singleelim":
                urls.push(`Entire Bracket:\n${window.location.href}graphics/${event}.html?bracketId=${bracketId}&title=${encodeURIComponent(bracketTitle)}&refresh=${refreshFreq}`);
                if (numRounds > 5) {
                    urls.push(`Top 16:\n${window.location.href}graphics/${event}.html?bracketId=${bracketId}&title=${encodeURIComponent(`${bracketTitle} - Top 16`)}&minRound=${numRounds - 3}&refresh=${refreshFreq}`);
                }
                break;
            case "roundrobin":
            case "swiss":
                for (let i = 1; i <= numRounds; i++) {
                    urls.push(`Round ${i}:\n${window.location.href}graphics/${event}.html?bracketId=${bracketId}&title=${encodeURIComponent(`${bracketTitle} - Round ${i}`)}&round=${i}&refresh=${refreshFreq}`);
                }
                break;
        }
        let builder = urls[0];
        for (let i = 1; i < urls.length; i++) {
            builder += "\n" + urls[i];
        }
        outElim.value = builder;
    });
}
function getID(search) {
    if (search.includes("https://battlefy.com/")) {
        const split = search.split("/");
        if (split[7] !== undefined) {
            return split[7];
        }
    }
    else {
        return search;
    }
}
function getMatchesFromBracketID(id) {
    return __awaiter(this, void 0, void 0, function* () {
        var matches = [];
        var bracketType;
        var numRounds;
        return fetch(`https://api.battlefy.com/stages/${id}`)
            .then((response) => {
            if (!response.ok) {
                return null;
            }
            return response.json();
        })
            .then(function (bracketResponse) {
            return __awaiter(this, void 0, void 0, function* () {
                if (bracketResponse === null) {
                    return null;
                }
                if (bracketResponse.bracket.type == "roundrobin") {
                    matches = yield getRoundRobinMatchesFromResponse(bracketResponse);
                    bracketType = bracketResponse.bracket.type;
                    numRounds = bracketResponse.bracket.teamsCount - 1;
                }
                else {
                    matches = yield getElimOrSwissMatches(id);
                    if (bracketResponse.bracket.type == "elimination") {
                        bracketType = bracketResponse.bracket.style == "single" ? "singleelim" : "doubleelim";
                        numRounds = bracketResponse.bracket.roundsCount;
                    }
                    else {
                        bracketType = bracketResponse.bracket.type;
                        numRounds = bracketResponse.bracket.series.length;
                    }
                }
                return {
                    bracketType: bracketType,
                    matches: matches,
                    numRounds: numRounds,
                    name: bracketResponse.name
                };
            });
        });
    });
}
function getElimOrSwissMatches(id) {
    return __awaiter(this, void 0, void 0, function* () {
        var matches = [];
        return fetch(`https://api.battlefy.com/stages/${id}/matches`)
            .then((response) => {
            return response.json();
        })
            .then((bracketResponse) => {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
            for (var i = 0; i < bracketResponse.length; i++) {
                const game = bracketResponse[i];
                var match = {
                    id: game._id,
                    topName: (_b = (_a = game === null || game === void 0 ? void 0 : game.top) === null || _a === void 0 ? void 0 : _a.team) === null || _b === void 0 ? void 0 : _b.name,
                    topScore: (_c = game === null || game === void 0 ? void 0 : game.top) === null || _c === void 0 ? void 0 : _c.score,
                    topSeed: (_d = game === null || game === void 0 ? void 0 : game.top) === null || _d === void 0 ? void 0 : _d.seedNumber,
                    topWinner: (_e = game === null || game === void 0 ? void 0 : game.top) === null || _e === void 0 ? void 0 : _e.winner,
                    bottomName: (_g = (_f = game === null || game === void 0 ? void 0 : game.bottom) === null || _f === void 0 ? void 0 : _f.team) === null || _g === void 0 ? void 0 : _g.name,
                    bottomScore: (_h = game === null || game === void 0 ? void 0 : game.bottom) === null || _h === void 0 ? void 0 : _h.score,
                    bottomSeed: (_j = game === null || game === void 0 ? void 0 : game.bottom) === null || _j === void 0 ? void 0 : _j.seedNumber,
                    bottomWinner: (_k = game === null || game === void 0 ? void 0 : game.bottom) === null || _k === void 0 ? void 0 : _k.winner,
                    matchNumber: game.matchNumber,
                    roundNumber: game.roundNumber,
                    type: game === null || game === void 0 ? void 0 : game.matchType
                };
                matches.push(match);
            }
            return matches;
        });
    });
}
function getRoundRobinMatchesFromResponse(res) {
    return __awaiter(this, void 0, void 0, function* () {
        var matches = [];
        var promises = [];
        for (var i = 0; i < res.groupIDs.length; i++) {
            promises.push(fetch(`https://api.battlefy.com/groups/${res.groupIDs[i]}/matches`));
        }
        return Promise.all(promises)
            .then((data) => Promise.all(data.map(data => {
            return data.json();
        })))
            .then((groupResponse) => {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j;
            for (var i = 0; i < groupResponse.length; i++) {
                for (var j = 0; j < groupResponse[i].length; j++) {
                    const game = groupResponse[i][j];
                    matches.push({
                        id: game._id,
                        topName: (_b = (_a = game === null || game === void 0 ? void 0 : game.top) === null || _a === void 0 ? void 0 : _a.team) === null || _b === void 0 ? void 0 : _b.name,
                        topScore: (_c = game === null || game === void 0 ? void 0 : game.top) === null || _c === void 0 ? void 0 : _c.score,
                        topWinner: (_d = game === null || game === void 0 ? void 0 : game.top) === null || _d === void 0 ? void 0 : _d.winner,
                        bottomName: (_f = (_e = game === null || game === void 0 ? void 0 : game.bottom) === null || _e === void 0 ? void 0 : _e.team) === null || _f === void 0 ? void 0 : _f.name,
                        bottomScore: (_g = game === null || game === void 0 ? void 0 : game.bottom) === null || _g === void 0 ? void 0 : _g.score,
                        bottomSeed: (_h = game === null || game === void 0 ? void 0 : game.bottom) === null || _h === void 0 ? void 0 : _h.seedNumber,
                        bottomWinner: (_j = game === null || game === void 0 ? void 0 : game.bottom) === null || _j === void 0 ? void 0 : _j.winner,
                        matchNumber: game.matchNumber,
                        roundNumber: game.roundNumber,
                        group: i + 1
                    });
                }
            }
            return matches;
        });
    });
}
function centerOnElements(smooth = false) {
    const root = document.getElementById("bracket-zone");
    const elementsOfInterest = document.querySelectorAll("#zoom > *");
    var maxWidth = 0;
    var minWidth = Number.MAX_SAFE_INTEGER;
    var maxHeight = 0;
    var minHeight = Number.MAX_SAFE_INTEGER;
    for (var i = 0; i < elementsOfInterest.length; i++) {
        const elim = elementsOfInterest[i];
        const pos = getPosOfElement(elim);
        maxWidth = Math.max(...pos[0], maxWidth);
        minWidth = Math.min(...pos[0], minWidth);
        maxHeight = Math.max(...pos[1], maxHeight);
        minHeight = Math.min(...pos[1], minHeight);
    }
    const targetWidth = maxWidth - minWidth;
    const targetHeight = maxHeight - minHeight;
    var scale = 1;
    if (targetWidth > root.clientWidth) {
        scale = (root.clientWidth / Math.max(targetWidth, 400)) * .97;
        if (targetHeight * scale > root.clientHeight) {
            scale = (root.clientHeight / Math.max(targetHeight, 400)) * .97;
        }
    }
    else {
        scale = (root.clientHeight / Math.max(targetHeight, 400)) * .97;
        if (targetWidth * scale > root.clientWidth) {
            scale = (root.clientWidth / Math.max(targetWidth, 400)) * .97;
        }
    }
    moveCamera((root.clientWidth - maxWidth * scale - minWidth * scale) / 2, (root.clientHeight - maxHeight * scale - minHeight * scale) / 2, scale, smooth);
}
function getPosOfElement(elim) {
    return [
        [elim.offsetLeft, elim.offsetLeft + elim.clientWidth],
        [elim.offsetTop, elim.offsetTop + elim.clientHeight]
    ];
}
function moveCamera(x, y, scale, smooth) {
    const camera = document.querySelector("#camera");
    const zoom = document.querySelector("#zoom");
    if (!smooth) {
        camera.style.transform = `translate(${x}px, ${y}px)`;
        zoom.style.transform = `scale(${scale.toString()})`;
    }
    else {
        gsap.to(camera, {
            duration: 1,
            ease: "power2.inOut",
            transform: `translate(${x}px, ${y}px)`
        });
        gsap.to(zoom, {
            duration: 1,
            ease: "power2.inOut",
            transform: `scale(${scale.toString()})`
        });
    }
}
function getDoubleEliminationElement(matches, minRound, focus) {
    const element = document.createElement("div");
    const winnersMatches = [];
    const losersMatches = [];
    for (var i = 0; i < matches.length; i++) {
        if (matches[i].type == "winner") {
            winnersMatches.push(matches[i]);
        }
        else {
            losersMatches.push(matches[i]);
        }
    }
    const winnersElement = getEliminationElement(winnersMatches, minRound, "winners");
    winnersElement.dataset.bracketType = "winners";
    const losersMinRound = minRound == 1 ? minRound : minRound - 1;
    const losersElement = getEliminationElement(losersMatches, losersMinRound, "losers");
    losersElement.dataset.bracketType = "losers";
    if (focus != "losers") {
        element.appendChild(winnersElement);
    }
    if (focus != "winners") {
        element.appendChild(losersElement);
    }
    return element;
}
function getEliminationElement(matches, minRound, roundNaming) {
    const element = document.createElement("div");
    element.className = "elim-bracket-wrapper";
    element.classList.add("bracket");
    const roundElims = [];
    const roundsNum = Math.max(...matches.map(o => o.roundNumber));
    const horConnectorElims = [];
    const vertConnectorElims = [];
    if (minRound <= 0) {
        minRound = 1;
    }
    for (var i = minRound - 1; i < roundsNum; i++) {
        const roundElim = document.createElement("div");
        roundElim.className = "elim-grid-wrapper";
        const roundHeader = document.createElement("div");
        roundHeader.className = "grid-header";
        if (roundNaming == "winners" && i == roundsNum - 2) {
            roundHeader.innerText = "Grand Finals";
        }
        else if (roundNaming == "winners" && i == roundsNum - 1) {
            roundHeader.innerText = "Reset";
        }
        else if (roundNaming == "losers" && i == roundsNum - 1) {
            roundHeader.innerText = "Losers Finals";
        }
        else if (i == roundsNum - 1) {
            roundHeader.innerText = "Finals";
        }
        else {
            roundHeader.innerText = "Round " + (i + 1);
        }
        roundElim.appendChild(roundHeader);
        roundElims.push(roundElim);
        element.appendChild(roundElim);
        if (i < roundsNum - 1) {
            const horConnector = document.createElement("div");
            horConnector.className = "elim-grid-wrapper hor-connector";
            horConnector.style.width = "15px";
            const connectorHeader = document.createElement("div");
            connectorHeader.className = "grid-header";
            horConnector.appendChild(connectorHeader);
            horConnectorElims.push(horConnector);
            element.appendChild(horConnector);
            const vertConnector = horConnector.cloneNode(true);
            vertConnector.classList.remove("hor-connector");
            vertConnector.classList.add("vert-connector");
            vertConnector.style.width = "";
            vertConnectorElims.push(vertConnector);
            element.appendChild(vertConnector);
        }
    }
    for (var i = 0; i < matches.length; i++) {
        const elim = getEliminationStyleMatchElement(matches[i]);
        if (matches[i].roundNumber >= minRound) {
            roundElims[matches[i].roundNumber - minRound].appendChild(elim);
        }
        else if (matches[i].roundNumber == 0) {
            elim.classList.add("elim-third");
            const roundElim = roundElims[roundElims.length - 1];
            roundElim.appendChild(elim);
            roundElim.style.minHeight = "12em";
            elim.style.transformOrigin = "bottom left";
            if (roundElims[0].childNodes.length < 8) {
                elim.style.marginLeft = "5px";
                elim.style.scale = "0.7";
            }
            else if (roundElims[0].childNodes.length < 16) {
                elim.style.scale = ".8";
            }
        }
    }
    for (var i = 0; i < matches.length; i++) {
        if (matches[i].roundNumber >= minRound && matches[i].roundNumber < roundsNum && matches[i].roundNumber != 0) {
            const horConnector = document.createElement("div");
            horConnector.style.height = "1px";
            horConnector.style.background = "var(--connector-color)";
            horConnectorElims[matches[i].roundNumber - minRound].appendChild(horConnector);
            if (roundElims[matches[i].roundNumber - minRound].childNodes.length % 2 == 1
                && getNumberChildrenWithoutThird(roundElims[matches[i].roundNumber - minRound]) != getNumberChildrenWithoutThird(roundElims[matches[i].roundNumber - minRound + 1])) {
                const vertConnector = document.createElement("div");
                vertConnector.style.width = "1px";
                if (i % 2 == 1) {
                    vertConnector.style.background = "linear-gradient(0deg, transparent 50%, var(--connector-color) 50%, var(--connector-color) 100%)";
                }
                else {
                    vertConnector.style.background = "linear-gradient(180deg, transparent 50%, var(--connector-color) 50%, var(--connector-color) 100%)";
                }
                vertConnectorElims[matches[i].roundNumber - minRound].appendChild(vertConnector);
            }
        }
    }
    return element;
}
function getNumberChildrenWithoutThird(element) {
    let count = 0;
    for (var i = 0; i < element.childNodes.length; i++) {
        const child = element.childNodes[i];
        if (!child.classList.contains("elim-third")) {
            count++;
        }
    }
    return count;
}
function getEliminationStyleMatchElement(match) {
    const element = document.createElement("div");
    element.className = "elim-round-wrapper";
    if (match.topWinner || match.bottomWinner) {
        element.dataset.roundStatus = "finished";
    }
    else if (match.topName !== undefined && match.bottomName === undefined || match.topName === undefined && match.bottomName !== undefined) {
        element.dataset.roundStatus = "awaiting";
    }
    else if (match.topName !== undefined || match.bottomName !== undefined) {
        element.dataset.roundStatus = "in-progress";
    }
    else {
        element.dataset.roundStatus = "not-started";
    }
    element.dataset.matchId = match.id;
    const topTeam = document.createElement("div");
    topTeam.className = "team-wrapper top";
    if (match.topWinner) {
        topTeam.classList.add("winner");
    }
    const topSeed = document.createElement("div");
    topSeed.classList.add("seed");
    topSeed.innerText = match.topSeed !== undefined ? match.topSeed.toString() : "-";
    const topName = document.createElement("div");
    topName.className = "team";
    topName.innerText = match.topName !== undefined ? getLimitedName(match.topName) : "-";
    const topScore = document.createElement("div");
    topScore.className = "score";
    topScore.innerText = match.topScore !== undefined ? match.topScore.toString() : "-";
    topTeam.appendChild(topSeed);
    topTeam.appendChild(topName);
    topTeam.appendChild(topScore);
    const bottomTeam = document.createElement("div");
    bottomTeam.className = "team-wrapper bottom";
    if (match.bottomWinner) {
        bottomTeam.classList.add("winner");
    }
    const bottomSeed = document.createElement("div");
    bottomSeed.classList.add("seed");
    bottomSeed.innerText = match.bottomSeed !== undefined ? match.bottomSeed.toString() : "-";
    const bottomName = document.createElement("div");
    bottomName.className = "team";
    bottomName.innerText = match.bottomName !== undefined ? getLimitedName(match.bottomName) : "-";
    const bottomScore = document.createElement("div");
    bottomScore.className = "score";
    bottomScore.innerText = match.bottomScore !== undefined ? match.bottomScore.toString() : "-";
    bottomTeam.appendChild(bottomSeed);
    bottomTeam.appendChild(bottomName);
    bottomTeam.appendChild(bottomScore);
    element.appendChild(topTeam);
    element.appendChild(bottomTeam);
    return element;
}
function getSwissElement(matches, round) {
    const element = document.createElement("div");
    element.className = "group-bracket-wrapper";
    element.classList.add("bracket");
    for (var i = 0; i < matches.length; i++) {
        if (matches[i].roundNumber == round) {
            element.appendChild(getGroupStyleMatchElement(matches[i]));
        }
    }
    return element;
}
function getRoundRobinElement(matches, round) {
    const element = document.createElement("div");
    element.className = "roundrobin-bracket-wrapper";
    element.classList.add("bracket");
    const groups = Array.apply(null, Array(matches[matches.length - 1].group)).map(function () { return []; });
    for (var i = 0; i < matches.length; i++) {
        if (matches[i].roundNumber == round) {
            groups[matches[i].group - 1].push(getGroupStyleMatchElement(matches[i]));
        }
    }
    for (var i = 0; i < groups.length; i++) {
        const groupElim = document.createElement("div");
        groupElim.className = "group-bracket-wrapper";
        groupElim.classList.add("bracket");
        const header = document.createElement("div");
        header.className = "group-header";
        header.innerText = "Group " + String.fromCharCode(65 + i);
        ;
        groupElim.appendChild(header);
        for (var j = 0; j < groups[i].length; j++) {
            groupElim.appendChild(groups[i][j]);
        }
        element.appendChild(groupElim);
    }
    return element;
}
function getGroupStyleMatchElement(match) {
    const element = document.createElement("div");
    element.className = "group-round-wrapper";
    if (match.topWinner || match.bottomWinner) {
        element.dataset.roundStatus = "finished";
    }
    else if (match.topName !== undefined || match.bottomName !== undefined) {
        element.dataset.roundStatus = "in-progress";
    }
    else {
        element.dataset.roundStatus = "not-started";
    }
    element.dataset.matchId = match.id;
    const topTeam = document.createElement("div");
    topTeam.className = "team-wrapper top";
    if (match.topWinner) {
        topTeam.classList.add("winner");
    }
    const topName = document.createElement("div");
    topName.className = "team";
    topName.innerText = match.topName !== undefined ? getLimitedName(match.topName) : "-";
    const topScore = document.createElement("div");
    topScore.className = "score";
    topScore.innerText = match.topScore !== undefined ? match.topScore.toString() : "-";
    topTeam.appendChild(topName);
    topTeam.appendChild(topScore);
    const bottomTeam = document.createElement("div");
    bottomTeam.className = "team-wrapper bottom";
    if (match.bottomWinner) {
        bottomTeam.classList.add("winner");
    }
    const bottomName = document.createElement("div");
    bottomName.className = "team";
    bottomName.innerText = match.bottomName !== undefined ? getLimitedName(match.bottomName) : "-";
    const bottomScore = document.createElement("div");
    bottomScore.className = "score";
    bottomScore.innerText = match.bottomScore !== undefined ? match.bottomScore.toString() : "-";
    bottomTeam.appendChild(bottomName);
    bottomTeam.appendChild(bottomScore);
    element.appendChild(topTeam);
    element.appendChild(bottomTeam);
    return element;
}
function getLimitedName(name, len = 22) {
    if (name === undefined) {
        return "-";
    }
    if (name.length > len) {
        return name.substring(0, len).trim() + "...";
    }
    return name;
}
//# sourceMappingURL=script.js.map