package main

import (
	"bytes"
	"compress/gzip"
	"fmt"
	"io/ioutil"
)

func GZipCompress(data []byte) []byte {
	var in bytes.Buffer
	w := gzip.NewWriter(&in)
	w.Write(data)
	w.Close()
	return in.Bytes()
}

func GZipUnCompress(data []byte) ([]byte, error) {
	b := bytes.NewReader(data)
	r, err := gzip.NewReader(b)
	if err != nil {
		return nil, err
	}
	defer r.Close()
	undatas, err := ioutil.ReadAll(r)
	if err != nil {
		return nil, err
	}
	return undatas, nil
}

func main() {
	// 读取压缩过的数据
	data, err := ioutil.ReadFile("data.bin")
	if err != nil {
		panic(err)
	}
	fmt.Printf("--- 111 compressed data: %s\n", string(data))
	// 解压数据
	data, err = GZipUnCompress(data)
	if err != nil {
		panic(err)
	}
	fmt.Printf("--- 222 origin data: %s\n", string(data))
}
