Diese Seite dient zur Dokumentation der Inhalte von Vorlesung & Skript von 'Informationsvisualisierung', welche für dieses Projekt berücksichtig werden müssen.
(nur selektierte und für das Projekt wichtige Inhalte werden hier aufgelistet; intuitiv richtig angewandte bzw. nicht relevante Inhalte sind für diese Dokumentation out-of-scope)

Human Visual Perception:
- 8% der männlichen Bevölkerung haben die Rot-Grün-Schwäche 
    --> Vermeidung von rot-grünen Farbkombinationen
- Präattentive Wahrnehmung: bei steigender Vielzahl an auffallenden Merkmalen werden diese für den/die Betrachter/in weniger deutlich
    --> Möglicher Map auf die Anzeige der Maßnahmen der Bundesländer in der Deutschlandkarte mittels definierter Icons
    --> Anzahl an unterschiedlichen Maßnahmen darf nicht zu groß sein, damit diese für den/die Betrachter/in noch gut erkennbar sind
    --> Beschränkung auf maximal 5 unterschiedliche Maßnahmen
- Gestaltgesetze wichtig für die korrekte Wahrnehmung der Graphiken
    --> Gesetz der Nähe für die Info-Popups für die jeweiligen Bundesländer: Popups sollten möglichst nahe zu dem dazugehörigen Bundesland erscheinen, damit die Zuordnung einfacher fällt
    --> Gesetz der Verbundenheit: Graphen entsprechend positionieren, damit der gemeinsame Zeitverlauf erkannt wird
        --> Inhalte die für alle Darstellungen gelten (z.B. Play-Button für Zeitverlauf) entsprechend distanziert zu allen Graphiken platzieren, damit nicht fälschlicherweise eine Verbundenheit nur zu einer Darstellung assoziiert wird
- SEEV Modell
    --> Einfache und intuitive Gestaltung/Positionierung

Colors:
- Angemessenen Kontrast zwischen Vorder- und Hintergrund schaffen
    --> Dunkelgrauer Hintergrund mit Graphiken aus Rot (Skala), Türkis und Weiß
- Schwarze oder weiße Ränder um Symbole reduzieren den Kontrast
    --> Da Hintergrundfarbe dunkelgrau, bietet sich weiß als Randfarbe an
    --> Weiße Umrandung um Bundesländer in der Deutschlandkarte, um Kontrast zum Hintergrund als auch innerhalb der Karte zu reduzieren und klare Grenzen zu schaffen
    --> Selbe Anwendung für Produktsymbole im Graphen für "Race" vorteilhaft (je nach Symbolfarbe möglicherweise allerdings nicht notwendig)
        --> Da Symbole klein sind, soll die Farbe eine hohe Sättigung besitzen
    --> Keine Anwendung für Graphen der gesmaten Infektionszahlen, da keine Symbole im Graphen enthalten sind
    --> Generelles Gerüst der Graphen in Weiß, um hohen Kontrast zum Hintergrund zu schaffen
- Wenig unterschiedliche Farben verwenden
    --> Weiß, Rot, Türkis
- Farbskala 
    --> Für Färbung der einzelnen Bundesländern zur Darstellung der jeweiligen Inzidenz wird eine Farbskala von Dunkel zu Hell (in rot) verwendet
        --> Inzidenzwerte sind ordinale Daten, weshalb die Helligkeit eine Rangordnung darstellt
        --> Kontrast zum Hintergrund ist bei jeder Helligkeitsstufe ausreichend
        --> Darstellungsweise wurde durch Medien schon geprägt
            --> Mögliche, falsche Interpretation von dem/der Betrachter/in im Falle von einer stark abweichenden Darstellung in einer geographischen Karte
        --> Rot wird mit "Gefahr" antizipiert, weshalb die Farbe zu der Darstellung eines Virus passt

Channels:
    --> Farbskala für Inzidenzwerte der Bundesländert hat eine intrinsische Bedeutung: je dunkler, desto höher ist der Inzidenzwert
        --> weiterer Faktor für die Nutzung der roten Farbskala in der Graphik der Deutschlandkarte
    --> Inzidenzwerte (relative Infektionen zur Einwohnerzahl) wird für die Deutschlandkarte gewählt und nicht die kompletten Infektionen, um nicht ungewollt einen "lie factor" zu erzeugen
        --> in Bundesländern mit höheren Einwohnerzahlen sind die Infektionszahlen (wahrscheinlich) höher und würden somit bei der Einfärbung der Bundesländer zu falschen Impressionen führen
            --> z.B. kann das Saarland deutlich weniger Gesamtinfektionen als Bayern besitzen, jedoch eine höhere Inzidenz haben
    --> Farbänderung der Bundesländer in intervallen, damit der/die Betrachter/in nicht zu viele Farbkategorien unterscheiden muss
        --> Fokus auf ?5? unterschiedliche Farbkategorien
        --> Nebeneffekt: Inzidenzwerte der Bundesländer können leichter (wenn auch nicht akurater) verglichen werden
