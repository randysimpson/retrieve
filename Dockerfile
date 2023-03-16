FROM golang:latest as builder
WORKDIR /go/src
RUN mkdir retrieve
WORKDIR /go/src/retrieve
ADD . .
RUN go mod tidy
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -ldflags '-extldflags "-static"' -o main .
FROM scratch
COPY --from=builder /go/src/retrieve/main /app/
WORKDIR /app
EXPOSE 3000
CMD ["./main"]
