var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
function pageLoad() {
    var _a, _b, _c;
    return __awaiter(this, void 0, void 0, function* () {
        const urlParams = new URLSearchParams(window.location.search);
        const bracketId = urlParams.get("bracketId");
        const round = (_a = parseInt(urlParams.get("round"))) !== null && _a !== void 0 ? _a : 1;
        const minRound = (_b = urlParams.get("minRound")) !== null && _b !== void 0 ? _b : "1";
        const focus = (_c = urlParams.get("focus")) !== null && _c !== void 0 ? _c : "none";
        const title = urlParams.get("title");
        console.log(minRound);
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
        setTimeout(() => {
            centerOnElements();
        }, 750);
    });
}
function updateGraphicURLs(event) {
    return __awaiter(this, void 0, void 0, function* () {
        const outElim = document.getElementById("out");
        const bracketId = document.getElementById("bracketId").value;
        const bracketTitle = document.getElementById("bracketTitle").value;
        const matchesReq = yield getMatchesFromBracketID(bracketId);
        const bracketType = matchesReq.bracketType;
        const numRounds = matchesReq.numRounds;
        console.log(numRounds);
        const urls = [];
        switch (bracketType) {
            case "doubleelim":
                urls.push(`Entire Bracket:\n${window.location.href}graphics/${event}.html?bracketId=${bracketId}&title=${encodeURIComponent(bracketTitle)}`);
                urls.push(`Winners only:\n${window.location.href}graphics/${event}.html?bracketId=${bracketId}&title=${encodeURIComponent(`${bracketTitle} - Winners`)}&focus=winners`);
                urls.push(`Losers only:\n${window.location.href}graphics/${event}.html?bracketId=${bracketId}&title=${encodeURIComponent(`${bracketTitle} - Losers`)}&focus=losers`);
                if (numRounds > 4) {
                    urls.push(`Top 24:\n${window.location.href}graphics/${event}.html?bracketId=${bracketId}&title=${encodeURIComponent(`${bracketTitle} - Top 24`)}&minRound=${numRounds - 3}`);
                }
                break;
            case "singleelim":
                urls.push(`Entire Bracket:\n${window.location.href}graphics/${event}.html?bracketId=${bracketId}&title=${encodeURIComponent(bracketTitle)}`);
                if (numRounds > 5) {
                    urls.push(`Top 16:\n${window.location.href}graphics/${event}.html?bracketId=${bracketId}&title=${encodeURIComponent(`${bracketTitle} - Top 16`)}&minRound=${numRounds - 3}`);
                }
                break;
            case "roundrobin":
            case "swiss":
                for (let i = 1; i <= numRounds; i++) {
                    urls.push(`Round ${i}:\n${window.location.href}graphics/${event}.html?bracketId=${bracketId}&title=${encodeURIComponent(`${bracketTitle} - Round ${i}`)}&round=${i}`);
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
function getMatchesFromBracketID(id) {
    return __awaiter(this, void 0, void 0, function* () {
        var matches = [];
        var bracketType;
        var numRounds;
        return fetch(`https://api.battlefy.com/stages/${id}`)
            .then((response) => {
            return response.json();
        })
            .then(function (bracketResponse) {
            return __awaiter(this, void 0, void 0, function* () {
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
                    numRounds: numRounds
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
function centerOnElements() {
    const root = document.getElementById("bracket-zone");
    const elementsOfInterest = document.querySelectorAll("#zoom > *");
    var maxWidth = 0;
    var minWidth = Number.MAX_SAFE_INTEGER;
    var maxHeight = 0;
    var minHeight = Number.MAX_SAFE_INTEGER;
    for (var i = 0; i < elementsOfInterest.length; i++) {
        const elim = elementsOfInterest[i];
        const pos = getPosOfElement(elim);
        if (elim.classList.contains("elim-third")) {
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
    moveCamera((root.clientWidth - maxWidth * scale - minWidth * scale) / 2, (root.clientHeight - maxHeight * scale - minHeight * scale) / 2, scale);
}
function getPosOfElement(elim) {
    return [
        [elim.offsetLeft, elim.offsetLeft + elim.clientWidth],
        [elim.offsetTop, elim.offsetTop + elim.clientHeight]
    ];
}
function moveCamera(x, y, scale) {
    const camera = document.querySelector("#camera");
    const zoom = document.querySelector("#zoom");
    camera.style.transform = `translate(${x}px, ${y}px)`;
    zoom.style.transform = `scale(${scale.toString()})`;
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
    const losersMinRound = minRound == 1 ? minRound : minRound + 1;
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
    }
    console.log(roundElims, matches);
    for (var i = 0; i < matches.length; i++) {
        const elim = getEliminationStyleMatchElement(matches[i]);
        if (matches[i].roundNumber >= minRound) {
            roundElims[matches[i].roundNumber - minRound].appendChild(elim);
        }
        else if (matches[i].roundNumber == 0) {
            elim.classList.add("elim-third");
            roundElims[roundElims.length - 1].appendChild(elim);
        }
    }
    return element;
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
    const topTeam = document.createElement("div");
    topTeam.className = "team-wrapper";
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
    bottomTeam.className = "team-wrapper";
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
    const topTeam = document.createElement("div");
    topTeam.className = "team-wrapper";
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
    bottomTeam.className = "team-wrapper";
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
    if (name.length > len) {
        return name.substring(0, len).trim() + "...";
    }
    return name;
}
//# sourceMappingURL=script.js.map