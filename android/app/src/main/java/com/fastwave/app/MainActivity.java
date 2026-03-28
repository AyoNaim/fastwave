package com.fastwave.app;

import android.os.Bundle;
import android.graphics.Color;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // Force the window background to white programmatically
        getWindow().getDecorView().setBackgroundColor(Color.WHITE);
    }
}
