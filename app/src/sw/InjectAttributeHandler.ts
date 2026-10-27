// Auto-ported from InjectAttributeHandler.java (Sketchware Pro) by scripts/j2ts.py, then hand-fixed.
// imports: android.util.Pair, com.besome.sketch.beans.ViewBean, org.xmlpull.v1.XmlPullParser, org.xmlpull.v1.XmlPullParserException, org.xmlpull.v1.XmlPullParserFactory, java.io.IOException, java.io.StringReader, java.util.HashSet, java.util.Optional, java.util.Set, mod.jbk.util.LogUtil
// <imports>
import { jiter, JSet, Pair } from '../codegen/jshim';
import { LogUtil, Optional, XmlPullParser, XmlPullParserFactory } from './env';
import { StringReader } from './platform';
// </imports>
export class InjectAttributeHandler {
  viewBean: any;
  constructor(viewBean: any) {
        this.viewBean = viewBean;
    }
  getBean(): any {
        return this.viewBean;
    }
  getAttributeValueOf(name: string): string {
        return this.getAttributeByName(name).orElse("");
    }
  contains(name: string): boolean {
        return this.getAttributeByName(name).isPresent();
    }
  getAttributeByName(name: string): any {
        for (const pair of jiter(this.getAttributes())) {
            if (pair.first.equals(name)) {
                return Optional.of(pair.second);
            }
        }
        return Optional.empty();
    }
  getAttributes(): any {
        let attributePairs = new JSet();

        try {
            let factory = XmlPullParserFactory.newInstance();
            factory.setNamespaceAware(true);
            let parser = factory.newPullParser();
            parser.setInput(new StringReader(
                    "<tag xmlns:android=\"http://schemas.android.com/apk/res/android\" " +
                            "xmlns:app=\"http://schemas.android.com/apk/res-auto\" " +
                            "xmlns:tools=\"http://schemas.android.com/tools\"" +
                            this.viewBean.inject + "></tag>"));

            let eventType = parser.getEventType();
            while (eventType != XmlPullParser.END_DOCUMENT) {
                if (eventType == XmlPullParser.START_TAG) {
                    for (let i = 0; i < parser.getAttributeCount(); i++) {
                        let name = parser.getAttributeName(i);
                        let value = parser.getAttributeValue(i);
                        attributePairs.add(new Pair(name, value));
                    }
                }

                eventType = parser.next();
            }
        } catch (e: any) {
            LogUtil.e("InjectAttributeHandler", "Failed to parse inject property of View "
                    + this.viewBean.id, e);
        }

        return attributePairs;
    }
}