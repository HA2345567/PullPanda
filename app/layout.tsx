import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { QueryProvider } from "@/components/providers/query-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PullPanda",
  description: "AI-powered Code Reviewer",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  function clean(node) {
                    if (!node || node.nodeType !== 1) return;
                    for (var i = node.attributes.length - 1; i >= 0; i--) {
                      var name = node.attributes[i].name;
                      if (name.indexOf('bis_') === 0 || name.indexOf('__processed_') === 0) {
                        node.removeAttribute(name);
                      }
                    }
                  }
                  var observer = new MutationObserver(function(mutations) {
                    for (var i = 0; i < mutations.length; i++) {
                      var m = mutations[i];
                      if (m.type === 'attributes' && m.attributeName) {
                        if (m.attributeName.indexOf('bis_') === 0 || m.attributeName.indexOf('__processed_') === 0) {
                          m.target.removeAttribute(m.attributeName);
                        }
                      } else if (m.type === 'childList') {
                        for (var j = 0; j < m.addedNodes.length; j++) {
                          var node = m.addedNodes[j];
                          clean(node);
                          if (node.querySelectorAll) {
                            var els = node.querySelectorAll('*');
                            for (var k = 0; k < els.length; k++) clean(els[k]);
                          }
                        }
                      }
                    }
                  });
                  observer.observe(document.documentElement, { attributes: true, subtree: true, childList: true });
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full" suppressHydrationWarning>
        <QueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
