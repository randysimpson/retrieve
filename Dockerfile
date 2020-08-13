FROM golang:1.14 as builder
WORKDIR /go/src
RUN mkdir retrieve
WORKDIR /go/src/retrieve
RUN go get k8s.io/klog
RUN go get github.com/lib/pq
RUN go get go.mongodb.org/mongo-driver/mongo
RUN go get github.com/gorilla/mux
ADD . .
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -ldflags '-extldflags "-static"' -o main .
FROM scratch
COPY --from=builder /go/src/retrieve/main /app/
WORKDIR /app
EXPOSE 3000
CMD ["./main"]