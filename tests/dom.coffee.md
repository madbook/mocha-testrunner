Make sure that `document.createElement` is working correctly

    assert = require('chai').assert

    describe "DOM", () ->
        describe "document", () ->
            it "should exist, that's kind of important!", () ->
                assert.isDefined document, 'it exists!'
        describe "HTMLElement", () ->
            it "should also exist!", () ->
                assert.isDefined HTMLElement, 'it also exists!'
        describe "document.createElement", () ->
            it "should create us an element!", () ->
                myDiv = document.createElement('div')
                assert.instanceOf myDiv, HTMLElement, 'success!'