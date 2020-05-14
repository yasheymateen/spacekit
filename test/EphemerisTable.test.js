import {expect} from '@jest/globals';
import {EphemerisTable} from '../src/EphemerisTable';
import {kmToAu} from '../src/Units';

describe('Ephemeris Table Construction', ()=>{
  const ephemeris = [
    [2458849.0, 1.0, 1.0, 1.0, 0.1, 0.1, 0.1],
    [2458849.1, 1.1, 1.1, 1.1, 0.11, 0.11, 0.11]
  ];

  test('Minimal constructor success', () => {
    const ephemerisData = {
      data: ephemeris
    };

    const ephemTable = new EphemerisTable(ephemerisData);
    expect(ephemTable).toBeDefined();
    expect(ephemTable._data.length).toBe(2);
    expect(ephemTable._units.distance).toBe('au');
    expect(ephemTable._units.time).toBe('day');
    expect(ephemTable._ephemType).toBe('cartesianposvel');
    expect(ephemTable._interpolationType).toBe('lagrange');
    expect(ephemTable._interpolationOrder).toBe(5);
  });

  test('Minimal full argument success', () => {
    const ephemerisData = {
      data: ephemeris,
      ephemerisType: 'cartesianposvel',
      distanceUnits: 'km',
      timeUnits: 'sec',
      interpolationType: 'lagrange',
      interpolationOrder: 6
    };

    const ephemTable = new EphemerisTable(ephemerisData);
    expect(ephemTable).toBeDefined();
    expect(ephemTable._data.length).toBe(2);
    expect(ephemTable._units.distance).toBe('km');
    expect(ephemTable._units.time).toBe('sec');
    expect(ephemTable._ephemType).toBe('cartesianposvel');
    expect(ephemTable._interpolationType).toBe('lagrange');
    expect(ephemTable._interpolationOrder).toBe(6);
  });

  describe('Failure modes', () =>{
    const ephemeris = [
      [2458849.0, 1.0, 1.0, 1.0, 0.1, 0.1, 0.1],
      [2458849.1, 1.1, 1.1, 1.1, 0.11, 0.11, 0.11]
    ];

    test('Fail on no argument constructor', () => {
      const errorMsg = 'EphemerisTable must be initialized with an ephemeris data structure'
      expect(()=>{new EphemerisTable()})
        .toThrowError(errorMsg);
    });

    test('Fail on empty argument', () => {
      const errorMsg =
        'EphemerisTable must be initialized with a structure containing an array of arrays of ephemeris data';
      expect(() => {new EphemerisTable({})})
        .toThrowError(errorMsg);
    });

    test('Fail on unknown ephemeris type', () => {
      const errorMsg = 'Unknown ephemeris type: MyNewUnknownEphemType';
      const ephemerisData = {
        data: ephemeris,
        ephemerisType: 'MyNewUnknownEphemType'
      };

      expect(() => {new EphemerisTable(ephemerisData)})
        .toThrowError(errorMsg);
    });

    test('Fail on non-array data field type', () => {
      const errorMsg =
        'EphemerisTable must be initialized with a structure containing an array of arrays of ephemeris data';
      const ephemerisData = {
          data: 'ephemeris data should be here'
      };

      expect(() => {new EphemerisTable(ephemerisData)})
        .toThrowError(errorMsg);
    });

    test('Fail on empty data field array', () => {
      const errorMsg =
        'EphemerisTable must be initialized with a structure containing an array of arrays of ephemeris data';
      const ephemerisData = {
        data: []
      };

      expect(() => {new EphemerisTable(ephemerisData)})
        .toThrowError(errorMsg);
    });

    test('Fail on non-array data field entry type', () => {
      const errorMsg =
        'EphemerisTable must be initialized with a structure containing an array of arrays of ephemeris data';
      const ephemerisData = {
        data: ['element1', 'element2']
      };

      expect(() => {new EphemerisTable(ephemerisData)})
        .toThrowError(errorMsg);
    });

    test('Fail on unknown time units', () => {
      const errorMsg = 'Unknown time units: MyNewUnknownTimeUnit';
      const ephemerisData = {
        data: ephemeris,
        timeUnits: 'MyNewUnknownTimeUnit'
      };

      expect(() => {new EphemerisTable(ephemerisData)})
        .toThrowError(errorMsg);
    });

    test('Fail on unknown distance units', () => {
      const errorMsg = 'Unknown distance units: MyNewUnknownDistanceUnit';
      const ephemerisData = {
        data: ephemeris,
        distanceUnits: 'MyNewUnknownDistanceUnit'
      };

      expect(() => {new EphemerisTable(ephemerisData)})
        .toThrowError(errorMsg);
    });

    test('Fail on unknown interpolation type', () => {
      const errorMsg = 'Unknown interpolation type: MyNewUnknownInterpolation';
      const ephemerisData = {
        data: ephemeris,
        interpolationType: 'MyNewUnknownInterpolation'
      };

      expect(() => {new EphemerisTable(ephemerisData)})
        .toThrowError(errorMsg);
    });

    test.each([
      [-1],
      [0],
      [21]
    ])('Fail on out of range %d interpolation order', (order) => {
      const ephemerisData = {
        data: ephemeris,
        interpolationOrder: order
      };

      expect(() => {new EphemerisTable(ephemerisData)})
        .toThrowError(/Interpolation order must be >0 and <20/);
    });

  });
});

describe('Ephemeris Table Unit Conversions', ()=> {
  const ephemeris = [
    [2458849.0, 1.0, 2.0, 3.0, 0.1, 0.2, 0.3]
  ];

  test.each([
    ['au', 'day', 1.0, 2.0, 3.0, 0.1, 0.2, 0.3],
    ['km', 'day', kmToAu(1.0), kmToAu(2.0), kmToAu(3.0), kmToAu(0.1), kmToAu(0.2), kmToAu(0.3)],
    ['km', 'sec', kmToAu(1.0), kmToAu(2.0), kmToAu(3.0),
      kmToAu(0.1)/86400.0, kmToAu(0.2)/86400.0, kmToAu(0.3)/86400.0],
  ])('%s distance, %s time, to internal units', (distanceUnitName, timeUnitName, x, y, z, vx, vy, vz) => {
    const ephemTable = new EphemerisTable({
      data: ephemeris,
      distanceUnits: distanceUnitName,
      timeUnits: timeUnitName
    });

    const firstLine = ephemTable._data[0];
    expect(firstLine[1]).toBeCloseTo(x,10);
    expect(firstLine[2]).toBeCloseTo(y,10);
    expect(firstLine[3]).toBeCloseTo(z,10);
    expect(firstLine[4]).toBeCloseTo(vx,10);
    expect(firstLine[5]).toBeCloseTo(vy,10);
    expect(firstLine[6]).toBeCloseTo(vz,10);
  })
});

describe('Ephemeris Table getPosition', ()=> {
  const ephem = [
    [2458849.5,
      -206989202.337052,
      -230690377.049615,
      -3593501.66181472,
      16.687770516701,
      -13.3316722546911,
      2.11151638406883,
    ],
    [
      2458879.5,
      -160853957.991521,
      -261594772.804662,
      1906010.76870765,
      18.8299943771761,
      -10.4417066788293,
      2.12128819944011,
    ],
    [
      2458909.5,
      -109834966.269488,
      -284485383.998363,
      7346888.19219363,
      20.4400085636901,
      -7.16522928027641,
      2.06593395876294,
    ],
    [
      2458939.5,
      -55426045.8429041,
      -298504783.14858,
      12559236.8059003,
      21.4340764623436,
      -3.61803347469132,
      1.94522656297565,
    ],
    [
      2458969.5,
      700740.271922723,
      -303125826.314767,
      17377436.5936175,
      21.7598103326871,
      0.062420209034819,
      1.76271498092491,
    ],
    [
      2458999.5,
      56785592.2271133,
      -298193955.729898,
      21649894.2145173,
      21.4025956485371,
      3.72819502541183,
      1.52561090543872,
    ],
    [
      2459029.5,
      111082034.625081,
      -283937581.264955,
      25247839.7778396,
      20.3871405446663,
      7.23392852255661,
      1.2441732813624,
    ],
    [
      2459059.5,
      161955146.28136,
      -260944905.356428,
      28071991.3194814,
      18.7737951408013,
      10.449253410829,
      0.930707156640917,
    ],
    [
      2459089.5,
      207964370.049318,
      -230111867.649376,
      30056334.6223833,
      16.6505912540206,
      13.2683522928012,
      0.59837489420997,
    ],
    [
      2459119.5,
      247922172.439639,
      -192570599.701394,
      31168822.6597849,
      14.1229350083109,
      15.6153080046127,
      0.260047428292031,
    ],
  ];
  const ephemTable = new EphemerisTable({data:ephem, distanceUnits:'km', timeUnits:'sec'});
  const compare = (position, expectedRow) => {
    expect(position[0]).toBeCloseTo(kmToAu(expectedRow[1]),12);
    expect(position[1]).toBeCloseTo(kmToAu(expectedRow[2]),12);
    expect(position[2]).toBeCloseTo(kmToAu(expectedRow[3]),12);
  };

  test('Get at first point', () => {
    const position = ephemTable.getPositionAtTime(ephem[0][0]);
    compare(position, ephem[0]);
  });

  test('Get at last point', () => {
    const index = ephem.length - 1;
    const position = ephemTable.getPositionAtTime(ephem[index][0]);
    compare(position, ephem[index]);
  });

  test('Get at middle point', () => {
    const index = 3;
    const position = ephemTable.getPositionAtTime(ephem[index][0]);
    compare(position, ephem[index]);
  });

  test('Get between points', () => {
    const i0 = 3;
    const i1 = i0 + 1;
    const jd = ephem[i0][0] + (ephem[i1][0]-ephem[i0][0])/2;
    const expectedPosition = [-0.18361487415945618, -2.018805387398647, 0.10045278624864683]
    const position = ephemTable.getPositionAtTime(jd);
    expect(position[0]).toBeCloseTo(expectedPosition[0],12);
    expect(position[1]).toBeCloseTo(expectedPosition[1],12);
    expect(position[2]).toBeCloseTo(expectedPosition[2],12);
  });

  test('Before first point returns first point', () => {
    const position = ephemTable.getPositionAtTime(ephem[0][0]-10);
    compare(position, ephem[0]);
  });

  test('After last point returns last point', () => {
    const position = ephemTable.getPositionAtTime(ephem[ephem.length - 1][0]+10);
    compare(position, ephem[ephem.length - 1]);
  });
});
