package db

import (
	"context"
	"fmt"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"time"
	//"go.mongodb.org/mongo-driver/mongo/readpref"
)

type MongoMetric struct {
	ID     primitive.ObjectID     `bson:"_id,omitempty"`
	Date   time.Time              `bson:"date,omitempty"`
	Metric string                 `bson:"metric,omitempty"`
	Source string                 `bson:"source,omitempty"`
	Tags   map[string]interface{} `bson:"tags,omitempty"`
	Value  float64                `bson:"value,omitempty"`
}

type mongoConfig struct {
	host   string
	port   int
	dbname string
}

var mongoConf mongoConfig

func SetConfigMongo(host string, port int, dbname string) {
	mongoConf = mongoConfig{}
	mongoConf.host = host
	mongoConf.port = port
	mongoConf.dbname = dbname
}

func MongoQuerySource(metric string, begin time.Time, end time.Time, source string) ([]Metric, error) {
	var metrics []Metric
	client, err := mongo.NewClient(options.Client().ApplyURI(fmt.Sprintf("mongodb://%s:%d", mongoConf.host, mongoConf.port)))

	ctx, _ := context.WithTimeout(context.Background(), 10*time.Second)
	//defer cancel()
	err = client.Connect(ctx)
	if err != nil {
		return metrics, err
	}
	defer client.Disconnect(ctx)

	collection := client.Database(mongoConf.dbname).Collection("metrics")

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()
	var mongoMetrics []MongoMetric
	cur, err := collection.Find(ctx, bson.M{"metric": metric, "date": bson.D{{"$gt", begin}, {"$lt", end}}, "source": source}, options.Find().SetSort(bson.D{{"date", -1}}))
	if err != nil {
		return metrics, err
	}
	if err = cur.All(ctx, &mongoMetrics); err != nil {
		return metrics, err
	}
	//convert MongoMetrics to Metrics.
	for _, mongoMetric := range mongoMetrics {
		var m Metric
		m = Metric{}
		m.Date = mongoMetric.Date
		m.Metric = mongoMetric.Metric
		m.Source = mongoMetric.Source
		m.Tags = mongoMetric.Tags
		m.Value = mongoMetric.Value
		metrics = append(metrics, m)
	}
	return metrics, nil
}

func MongoQuery(metric string, begin time.Time, end time.Time) ([]Metric, error) {
	var metrics []Metric
	client, err := mongo.NewClient(options.Client().ApplyURI(fmt.Sprintf("mongodb://%s:%d", mongoConf.host, mongoConf.port)))

	ctx, _ := context.WithTimeout(context.Background(), 10*time.Second)
	//defer cancel()
	err = client.Connect(ctx)
	if err != nil {
		return metrics, err
	}
	defer client.Disconnect(ctx)

	collection := client.Database(mongoConf.dbname).Collection("metrics")

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()
	var mongoMetrics []MongoMetric
	cur, err := collection.Find(ctx, bson.M{"metric": metric, "date": bson.D{{"$gt", begin}, {"$lt", end}}}, options.Find().SetSort(bson.D{{"date", -1}}))
	if err != nil {
		return metrics, err
	}
	if err = cur.All(ctx, &mongoMetrics); err != nil {
		return metrics, err
	}
	//convert MongoMetrics to Metrics.
	for _, mongoMetric := range mongoMetrics {
		var m Metric
		m = Metric{}
		m.Date = mongoMetric.Date
		m.Metric = mongoMetric.Metric
		m.Source = mongoMetric.Source
		m.Tags = mongoMetric.Tags
		m.Value = mongoMetric.Value
		metrics = append(metrics, m)
	}
	return metrics, nil
}
