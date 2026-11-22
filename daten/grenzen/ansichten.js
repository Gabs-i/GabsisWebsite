/* Kontinentansichten für das Grenzregionen-Quiz: Projektion und Bildausschnitt (wird auch beim Auswählen der Regionen benutzt) */
(function (root) {
  var A = {
    europa:      { name: 'Europa',      w: 1000, h: 1050, proj: function (d3) { return d3.geoConicConformal().rotate([-15, 0]).parallels([40, 65]); },
                   rahmen: [[-11, 36], [60, 36], [60, 70], [-11, 70], [25, 71], [25, 34.5], [5, 35.5], [-9, 43]] },
    asien:       { name: 'Asien',       w: 1000, h: 820,  proj: function (d3) { return d3.geoAzimuthalEqualArea().rotate([-100, -40]); },
                   rahmen: [[26, 40], [44, 12], [95, -10], [141, -9], [178, 64], [-170, 66], [100, 78], [60, 74], [30, 62]] },
    afrika:      { name: 'Afrika',      w: 1000, h: 1080, proj: function (d3) { return d3.geoAzimuthalEqualArea().rotate([-18, -3]); },
                   rahmen: [[-17.5, 15], [51.5, 12], [20, 37.5], [20, -35], [-17, 28], [50, -25], [10, 37.5], [33, 31.5]] },
    nordamerika: { name: 'Nordamerika', w: 1000, h: 1000, proj: function (d3) { return d3.geoConicConformal().rotate([100, 0]).parallels([20, 60]); },
                   rahmen: [[-166, 66], [-56, 48], [-78, 7.5], [-117, 32.5], [-95, 72], [-64, 18], [-130, 55], [-82, 25]] },
    suedamerika: { name: 'Südamerika',  w: 1000, h: 1250, proj: function (d3) { return d3.geoAzimuthalEqualArea().rotate([60, 15]); },
                   rahmen: [[-81.5, -5], [-34.8, -7], [-72, 12.5], [-68, -55.5], [-60, 9], [-50, 1], [-75, -50]] }
  };
  A.projektion = function (d3, key) {
    var a = A[key], pad = 30;
    return a.proj(d3).fitExtent([[pad, pad], [a.w - pad, a.h - pad]], { type: 'MultiPoint', coordinates: a.rahmen });
  };
  if (typeof module !== 'undefined') module.exports = A; else (root.TAG = root.TAG || {}).grenzAnsichten = A;
})(this);
