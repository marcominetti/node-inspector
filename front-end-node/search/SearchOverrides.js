/*jshint browser:true, nonew:false*/
/*global WebInspector:true, InspectorFrontendHost:true, InspectorFrontendHostAPI:true*/

(function() {
  var createSearchRegex = function(query, caseSensitive, isRegex)
  {
    var regexFlags = caseSensitive ? "g" : "gi";
    var regexObject;

    if (isRegex) {
      try {
        regexObject = new RegExp('^.*?'+query+'.*?$|^.*?'+query+'.*?\n|\n.*?'+query+'.*?\n|\n.*?'+query+'.*?$', regexFlags);
      } catch (e) {
        // Silent catch.
      }
    }

    if (!regexObject)
      regexObject = createPlainTextSearchRegex(query, regexFlags);

    return regexObject;
  }

  var createPlainTextSearchRegex = function(query, flags)
  {
    // This should be kept the same as the one in ContentSearchUtils.cpp.
    var regexSpecialCharacters = "^[]{}()\\.^$*+?|-,";
    var regex = "";
    for (var i = 0; i < query.length; ++i) {
      var c = query.charAt(i);
      if (regexSpecialCharacters.indexOf(c) != -1)
        regex += "\\";
      regex += c;
    }
    return new RegExp('^.*?'+regex+'.*?$|^.*?'+regex+'.*?\n|\n.*?'+regex+'.*?\n|\n.*?'+regex+'.*?$', flags || "");
  }



  WebInspector.ContentProvider.performSearchInContent = function(content, query, caseSensitive, isRegex)
  {
    var regex = createSearchRegex(query, caseSensitive, isRegex);

    var result = [];
    var lastMatch;
    var isMinified = false;

    var firstNewLine = content.indexOf('\n');
    if (content.length > 1024) {
      if (firstNewLine > 1024 || firstNewLine === -1) {
        isMinified = true;
      }
    }

    while(lastMatch=regex.exec(content)) {
      var lineContent = lastMatch[0];
      var firstChar = lineContent.charCodeAt(0);
      var lastChar = lineContent.charCodeAt(lineContent.length-1);
      var lineMatchesBefore = content.substr(0,regex.lastIndex).match(/\n/g);
      if (lineMatchesBefore){
        var i = lineMatchesBefore.length;
        if (lastChar !== 10){
          ++i;
        } else {
          lineContent = lineContent.substr(0,lineContent.length-1);
        }
        if (firstChar === 10){
          lineContent = lineContent.substr(1);
        }
        if (isMinified === true && lineContent.length > 1024) {
          lineContent = ' ... (line too long)';
        }
        result.push(new WebInspector.ContentProvider.SearchMatch(i, lineContent));
      }
    }
    return result;
  }
})()

WebInspector.FileBasedSearchResultsPane.FileTreeElement.prototype._appendSearchMatches = function(fromIndex, toIndex)
{
  var searchResult = this._searchResult;
  var uiSourceCode = searchResult.uiSourceCode;
  var searchMatches = searchResult.searchMatches;

  var queries = this._searchConfig.queries();
  var regexes = [];
  for (var i = 0; i < queries.length; ++i)
    regexes.push(createSearchRegex(queries[i], !this._searchConfig.ignoreCase(), this._searchConfig.isRegex()));

  for (var i = fromIndex; i < toIndex; ++i) {
    var lineNumber = searchMatches[i].lineNumber;
    var lineContent = searchMatches[i].lineContent;
    var matchRanges = [];
    for (var j = 0; j < regexes.length; ++j)
      matchRanges = matchRanges.concat(this._regexMatchRanges(lineContent, regexes[j]));

    var anchor;
    if (!matchRanges[0]){
      matchRanges[0] = new WebInspector.SourceRange(0,0);
      anchor = this._createAnchor(uiSourceCode, lineNumber, matchRanges[0].offset);
    } else {
      anchor = this._createAnchor(uiSourceCode, lineNumber, matchRanges[0].offset);
    }

    var numberString = numberToStringWithSpacesPadding(lineNumber + 1, 4);
    var lineNumberSpan = createElement("span");
    lineNumberSpan.classList.add("search-match-line-number");
    lineNumberSpan.textContent = numberString;
    anchor.appendChild(lineNumberSpan);

    var contentSpan = this._createContentSpan(lineContent, matchRanges);
    anchor.appendChild(contentSpan);

    var searchMatchElement = new TreeElement("");
    searchMatchElement.selectable = false;
    this.appendChild(searchMatchElement);
    searchMatchElement.listItemElement.className = "search-match source-code";
    searchMatchElement.listItemElement.appendChild(anchor);
  }
}