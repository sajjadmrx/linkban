package com.revisit.app;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "ShareBridge")
public class ShareBridgePlugin extends Plugin {

    private static String pendingSharedUrl = null;

    public static void setPendingSharedUrl(String url) {
        pendingSharedUrl = url;
    }

    @PluginMethod
    public void getSharedLink(PluginCall call) {
        JSObject ret = new JSObject();
        if (pendingSharedUrl != null) {
            ret.put("url", pendingSharedUrl);
            pendingSharedUrl = null;
        } else {
            ret.put("url", null);
        }
        call.resolve(ret);
    }
}
