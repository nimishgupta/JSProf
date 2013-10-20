SOURCES=$(wildcard *.js)
OBJECTS=$(SOURCES:.js=.d)


.PHONY = all clean


all: .done
	echo $(OBJECTS)

.done: $(OBJECTS)
	touch .done

%.d:%.js
	node ../../functional/instrument.js $< $*.tmp
	cat depends print.js $*.tmp ../../functional/profile_helper.js >> $*_inst.js
	rm $*.tmp
	touch .$*.d

clean:
	rm -f *_inst.js .done *.d || true
