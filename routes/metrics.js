const express = require('express');
const router = express.Router();
const dbInterface = require('../controller/dbInterface');

/* GET home page. */
router.get('/', (req, res) => {
  const query = {
    metric: 'temperature',
    date: {
      $gte: new Date('08/20/19'),
      $lte: new Date('08/21/19')
    }
  }
  /*const query = {
    metric: 'temperature'
  };*/
  dbInterface.retrieve("metrics",
    query,
    { date: 1 }
  ).then(result => {
      res.json(result);
    }, err => {
      res.json(err);
    });
});

router.post('/', (req, res) => {
  if(!req.body.metric || !req.body.beginDate) {
    res.status(400).json({
      status: 'Required object must have metric and beginDate.'
    });
  } else {
    const query = {
      metric: req.body.metric,
      date: {
        $gte: new Date(req.body.beginDate)
      }
    };
    //check for endDate
    if(req.body.endDate) {
      query.date.$lte = new Date(req.body.endDate)
    }
    //check for source
    if(req.body.source) {
      query.source = req.body.source;
    }
    dbInterface.retrieve("metrics",
      query,
      { date: 1 }
    ).then(result => {
        res.json(result);
      }, err => {
        res.json(err);
      });
  }
});

module.exports = router;

//api
/*
//required
  beginDate:
  endDate:
  metric
//optional
  source
  tags
*/

///example metrics:
/*
[
  {
    'date': '2019-08-17T14:34:01.499389Z',
    'tags': {
      'pin': 23,
      'sensor': 'DHT22'
    },
    'metric': 'temperature',
    'value': 24.700000762939453,
    'source': 'test'
  },
  {
    'date': '2019-08-17T14:34:01.499389Z',
    'tags': {
      'pin': 23,
      'sensor': 'DHT22'
    },
    'metric': 'humidity',
    'value': 36.599998474121094,
    'source': 'test'
  }
]
*/

/*
[
  {
    'metric': 'load15min.mean',
    'value': 0.24,
    'date': '2019-08-17T14:34:32.355504Z',
    'source': 'test'
  }, {
    'metric': 'load5min.mean',
    'value': 0.36,
    'date': '2019-08-17T14:34:32.355504Z',
    'source': 'test'
  }, {
    'metric': 'load1min.mean',
    'value': 0.82,
    'date': '2019-08-17T14:34:32.355504Z',
    'source': 'test'
  }, {
    'metric': 'users',
    'value': 0,
    'date': '2019-08-17T14:34:32.355504Z',
    'source': 'test'
  }, {
    'metric': 'uptime',
    'value': 12272,
    'date': '2019-08-17T14:34:32.355504Z',
    'source': 'test'
  }, {
    'metric': 'disk.Available',
    'tags': {'mount': '/sys/firmware', 'filesystem': 'tmpfs'},
    'value': 474152,
    'date': '2019-08-17T14:34:32.355504Z',
    'source': 'test'
  }, {
    'metric': 'disk.Used',
    'tags': {'mount': '/sys/firmware', 'filesystem': 'tmpfs'},
    'value': 0,
    'date': '2019-08-17T14:34:32.355504Z',
    'source': 'test'
  }, {
    'metric': 'disk.1K-blocks',
    'tags': {'mount': '/sys/firmware', 'filesystem': 'tmpfs'},
    'value': 474152,
    'date': '2019-08-17T14:34:32.355504Z',
    'source': 'test'
  }, {
    'metric': 'disk.Available',
    'tags': {'mount': '/proc/asound', 'filesystem': 'tmpfs'},
    'value': 474152,
    'date': '2019-08-17T14:34:32.355504Z',
    'source': 'test'
  }, {
    'metric': 'disk.Used', 'tags': {'mount': '/proc/asound', 'filesystem': 'tmpfs'}, 'value': 0, 'date': '2019-08-17T14:34:32.355504Z', 'source': 'test'}, {'metric': 'disk.1K-blocks', 'tags': {'mount': '/proc/asound', 'filesystem': 'tmpfs'}, 'value': 474152, 'date': '2019-08-17T14:34:32.355504Z', 'source': 'test'}, {'metric': 'disk.Available', 'tags': {'mount': '/etc/hosts', 'filesystem': '/dev/root'}, 'value': 50195232, 'date': '2019-08-17T14:34:32.355504Z', 'source': 'test'}, {'metric': 'disk.Used', 'tags': {'mount': '/etc/hosts', 'filesystem': '/dev/root'}, 'value': 7766380, 'date': '2019-08-17T14:34:32.355504Z', 'source': 'test'}, {'metric': 'disk.1K-blocks', 'tags': {'mount': '/etc/hosts', 'filesystem': '/dev/root'}, 'value': 61087780, 'date': '2019-08-17T14:34:32.355504Z', 'source': 'test'}, {'metric': 'disk.Available', 'tags': {'mount': '/dev/shm', 'filesystem': 'shm'}, 'value': 65536, 'date': '2019-08-17T14:34:32.355504Z', 'source': 'test'}, {'metric': 'disk.Used', 'tags': {'mount': '/dev/shm', 'filesystem': 'shm'}, 'value': 0, 'date': '2019-08-17T14:34:32.355504Z', 'source': 'test'}, {'metric': 'disk.1K-blocks', 'tags': {'mount': '/dev/shm', 'filesystem': 'shm'}, 'value': 65536, 'date': '2019-08-17T14:34:32.355504Z', 'source': 'test'}, {'metric': 'disk.Available', 'tags': {'mount': '/dev', 'filesystem': 'tmpfs'}, 'value': 65536, 'date': '2019-08-17T14:34:32.355504Z', 'source': 'test'}, {'metric': 'disk.Used', 'tags': {'mount': '/dev', 'filesystem': 'tmpfs'}, 'value': 0, 'date': '2019-08-17T14:34:32.355504Z', 'source': 'test'}, {'metric': 'disk.1K-blocks', 'tags': {'mount': '/dev', 'filesystem': 'tmpfs'}, 'value': 65536, 'date': '2019-08-17T14:34:32.355504Z', 'source': 'test'}, {'metric': 'disk.Available', 'tags': {'mount': '/', 'filesystem': 'overlay'}, 'value': 50195232, 'date': '2019-08-17T14:34:32.355504Z', 'source': 'test'}, {'metric': 'disk.Used', 'tags': {'mount': '/', 'filesystem': 'overlay'}, 'value': 7766380, 'date': '2019-08-17T14:34:32.355504Z', 'source': 'test'}, {'metric': 'disk.1K-blocks', 'tags': {'mount': '/', 'filesystem': 'overlay'}, 'value': 61087780, 'date': '2019-08-17T14:34:32.355504Z', 'source': 'test'}, {'metric': 'Swap.free', 'value': 0, 'date': '2019-08-17T14:34:32.355504Z', 'source': 'test'}, {'metric': 'Swap.used', 'value': 0, 'date': '2019-08-17T14:34:32.355504Z', 'source': 'test'}, {'metric': 'Swap.total', 'value': 0, 'date': '2019-08-17T14:34:32.355504Z', 'source': 'test'}, {'metric': 'buffers_cache.used', 'value': 575088, 'date': '2019-08-17T14:34:32.355504Z', 'source': 'test'}, {'metric': 'buffers_cache.total', 'value': 373216, 'date': '2019-08-17T14:34:32.355504Z', 'source': 'test'}, {'metric': 'Mem.cached', 'value': 391204, 'date': '2019-08-17T14:34:32.355504Z', 'source': 'test'}, {'metric': 'Mem.buffers', 'value': 97544, 'date': '2019-08-17T14:34:32.355504Z', 'source': 'test'}, {'metric': 'Mem.shared', 'value': 55380, 'date': '2019-08-17T14:34:32.355504Z', 'source': 'test'
  }, {
    'metric': 'Mem.free',
    'value': 86340,
    'date': '2019-08-17T14:34:32.355504Z',
    'source': 'test'
  }, {
    'metric': 'Mem.used',
    'value': 861964,
    'date': '2019-08-17T14:34:32.355504Z',
    'source': 'test'
  }, {
    'metric': 'Mem.total',
    'value': 948304,
    'date': '2019-08-17T14:34:32.355504Z',
    'source': 'test'
  }]
*/
